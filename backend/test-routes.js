const express = require('express');

const app = express();
const protect = require('./middleware/auth.middleware');
const {registerUser, login, listUsers} = require('./controllers/user.controller');

const router = express.Router();

router.post("/users/register", registerUser);
router.post("/users/login", login);
router.get("/users", protect, listUsers);

app.use('/api', router);

console.log('Routes registered:');
router.stack.forEach(r => {
  if (r.route) {
    const methods = Object.keys(r.route.methods);
    console.log(`  ${methods[0].toUpperCase()} /api${r.route.path}`);
  }
});

app.listen(3001, () => {
  console.log('\nTest server running on port 3001');
  console.log('Try: curl http://localhost:3001/api/users');
});
