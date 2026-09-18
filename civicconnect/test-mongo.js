const mongoose = require('mongoose');

const uri = 'mongodb://ambaliyarishit3635_db_user:Rishit2905@ac-zvtqpow-shard-00-00.fl3kqjf.mongodb.net:27017,ac-zvtqpow-shard-00-01.fl3kqjf.mongodb.net:27017,ac-zvtqpow-shard-00-02.fl3kqjf.mongodb.net:27017/civicconnect?ssl=true&replicaSet=atlas-zvtqpow-shard-0&authSource=admin&retryWrites=true&w=majority&appName=CODECRAFT';

mongoose.connect(uri, { family: 4 })
  .then(() => {
    console.log('SUCCESS!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
