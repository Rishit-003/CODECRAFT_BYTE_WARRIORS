import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDF1lgtcaZuAqxBLpmi0TqzdIRxeghoT0",
  authDomain: "civicconnect-ea129.firebaseapp.com",
  projectId: "civicconnect-ea129",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const departments = [
  'transportation',
  'infrastructure',
  'sanitation',
  'public_safety',
  'parks_environment',
  'water_supply'
];

const names = [
  ['Alice T.', 'Bob T.'],
  ['Charlie I.', 'Dave I.'],
  ['Eve S.', 'Frank S.'],
  ['Grace P.', 'Hank P.'],
  ['Ivy E.', 'Jack E.'],
  ['Karen W.', 'Leo W.']
];

async function seed() {
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    for (let j = 0; j < 2; j++) {
      const name = names[i][j];
      const id = `mock_worker_${dept}_${j}`;
      const state = 'California';
      const city = j === 0 ? 'San Francisco' : 'Los Angeles';
      const assignedZone = j === 0 ? 'Zone A - Downtown' : 'Zone D - Westside';

      await setDoc(doc(db, 'users', id), {
        id,
        firebaseUid: id,
        name,
        email: `${name.replace(' ', '').replace('.', '').toLowerCase()}@civicconnect.mock`,
        role: 'worker',
        department: dept,
        designation: 'Inspector',
        employeeId: `EMP-${dept.substring(0, 3).toUpperCase()}-${j + 1}00`,
        state,
        city,
        assignedZone,
        contactNumber: '555-0000',
        isActive: true,
        tasksCompleted: 0,
        avgResolutionTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`Created worker ${name} in ${dept}`);
    }
  }
}

seed().then(() => {
    console.log('Done');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
