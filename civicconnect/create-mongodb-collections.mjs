import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicconnect';
const departments = [
  'transportation', 'infrastructure', 'sanitation', 'public_safety',
  'parks_environment', 'water_supply',
];
const categories = [
  'pothole', 'broken_streetlight', 'garbage_overflow', 'water_leak',
  'road_damage', 'fallen_tree', 'traffic_signal', 'drainage_block',
  'illegal_dumping', 'park_damage', 'noise_complaint', 'other',
];

function objectId() {
  return { bsonType: 'objectId' };
}

async function ensureCollection(db, name, validator) {
  const exists = (await db.listCollections({ name }, { nameOnly: true }).toArray()).length > 0;
  if (!exists) await db.createCollection(name, { validator: { $jsonSchema: validator } });
  else await db.command({ collMod: name, validator: { $jsonSchema: validator } });
}

await mongoose.connect(uri);
const db = mongoose.connection.db;

await ensureCollection(db, 'users', {
  bsonType: 'object', required: ['name', 'email', 'role', 'createdAt', 'updatedAt'],
  properties: {
    firebaseUid: { bsonType: 'string' }, name: { bsonType: 'string' },
    email: { bsonType: 'string' }, passwordHash: { bsonType: 'string' }, phone: { bsonType: 'string' },
    role: { enum: ['citizen', 'worker', 'admin'] }, avatar: { bsonType: 'string' },
    address: { bsonType: 'string' }, area: { bsonType: 'string' },
    department: { enum: departments }, designation: { bsonType: 'string' },
    employeeId: { bsonType: 'string' }, assignedZone: { bsonType: 'string' }, assignedZoneId: objectId(),
    contactNumber: { bsonType: 'string' }, isActive: { bsonType: 'bool' },
    tasksCompleted: { bsonType: 'number' }, avgResolutionTime: { bsonType: 'number' },
    adminId: { bsonType: 'string' }, departmentOversight: { bsonType: 'array', items: { enum: departments } },
    accessLevel: { enum: ['super_admin', 'department_admin'] },
    createdAt: { bsonType: 'date' }, updatedAt: { bsonType: 'date' },
  },
});

await ensureCollection(db, 'issues', {
  bsonType: 'object', required: ['title', 'description', 'category', 'department', 'location', 'reportedBy', 'createdAt', 'updatedAt'],
  properties: {
    title: { bsonType: 'string' }, description: { bsonType: 'string' }, category: { enum: categories },
    department: { enum: departments }, status: { enum: ['reported', 'acknowledged', 'assigned', 'in_progress', 'resolved'] },
    urgency: { enum: ['low', 'medium', 'high'] },
    location: { bsonType: 'object', required: ['type', 'coordinates', 'address'], properties: {
      type: { enum: ['Point'] }, coordinates: { bsonType: 'array', minItems: 2, maxItems: 2, items: { bsonType: 'number' } },
      address: { bsonType: 'string' }, zone: { bsonType: 'string' }, zoneId: objectId(),
    } },
    photos: { bsonType: 'array', items: { bsonType: 'string' } }, reportedBy: objectId(),
    reporterName: { bsonType: 'string' }, assignedTo: objectId(), assignedWorkerName: { bsonType: 'string' },
    upvotes: { bsonType: 'array', items: { bsonType: 'string' } }, upvoteCount: { bsonType: 'int' },
    resolutionNotes: { bsonType: 'string' }, resolutionPhoto: { bsonType: 'string' }, resolvedAt: { bsonType: 'date' },
    createdAt: { bsonType: 'date' }, updatedAt: { bsonType: 'date' },
  },
});

await ensureCollection(db, 'issue_upvotes', {
  bsonType: 'object', required: ['issueId', 'userId', 'createdAt'],
  properties: { issueId: objectId(), userId: objectId(), createdAt: { bsonType: 'date' } },
});

await ensureCollection(db, 'issue_updates', {
  bsonType: 'object', required: ['issueId', 'action', 'createdAt'],
  properties: {
    issueId: objectId(), updatedBy: objectId(),
    action: { enum: ['reported', 'status_changed', 'assigned', 'comment_added', 'resolved'] },
    previousStatus: { bsonType: 'string' }, newStatus: { bsonType: 'string' }, note: { bsonType: 'string' },
    assignedTo: objectId(), createdAt: { bsonType: 'date' },
  },
});

await ensureCollection(db, 'notifications', {
  bsonType: 'object', required: ['userId', 'title', 'message', 'type', 'read', 'createdAt'],
  properties: {
    userId: objectId(), issueId: objectId(), title: { bsonType: 'string' }, message: { bsonType: 'string' },
    type: { enum: ['status_update', 'new_assignment', 'upvote', 'system'] }, read: { bsonType: 'bool' },
    createdAt: { bsonType: 'date' },
  },
});

await ensureCollection(db, 'zones', {
  bsonType: 'object', required: ['name', 'isActive', 'createdAt'],
  properties: {
    name: { bsonType: 'string' }, wardNumber: { bsonType: 'string' },
    departmentContacts: { bsonType: 'array', items: { bsonType: 'object', properties: {
      department: { enum: departments }, phone: { bsonType: 'string' }, email: { bsonType: 'string' },
    } } },
    boundary: { bsonType: 'object', properties: { type: { enum: ['Polygon'] }, coordinates: { bsonType: 'array' } } },
    isActive: { bsonType: 'bool' }, createdAt: { bsonType: 'date' },
  },
});

await Promise.all([
  db.collection('users').createIndex({ email: 1 }, { unique: true }),
  db.collection('users').createIndex({ employeeId: 1 }, { unique: true, sparse: true }),
  db.collection('users').createIndex({ adminId: 1 }, { unique: true, sparse: true }),
  db.collection('issues').createIndex({ location: '2dsphere' }),
  db.collection('issues').createIndex({ status: 1, department: 1, createdAt: -1 }),
  db.collection('issues').createIndex({ reportedBy: 1, createdAt: -1 }),
  db.collection('issues').createIndex({ assignedTo: 1, status: 1 }),
  db.collection('issue_upvotes').createIndex({ issueId: 1, userId: 1 }, { unique: true }),
  db.collection('issue_updates').createIndex({ issueId: 1, createdAt: -1 }),
  db.collection('notifications').createIndex({ userId: 1, read: 1, createdAt: -1 }),
  db.collection('zones').createIndex({ name: 1 }, { unique: true }),
]);

console.log('Created and configured civicconnect collections: users, issues, issue_upvotes, issue_updates, notifications, zones.');
await mongoose.disconnect();
