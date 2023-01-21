import { Low } from "lowdb";
import { dirname, join } from "path";
import { JSONFile } from "lowdb/node";
import { fileURLToPath } from "url";
import lodash from "lodash";

const __dirname = dirname(fileURLToPath(import.meta.url));

class LowWithLodash extends Low {
  chain = lodash.chain(this).get("data");
}

const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new LowWithLodash(adapter);
await db.read();
db.data ||= { users: [] };

export const addUser = (userData) => {
  let totalUser = db.data.users.length;
  let user = { id: totalUser + 1, ...userData };
  db.data.users.push({ ...user });
  db.write();
  return user;
};

export const updateUser = (id, userData) => {
  db.chain.get("users").find({ id: id }).assign(userData).value();
  db.write();
};

// export const deleteUser = (userIdx, userData) => {
//   db.data.users[userIdx] = { ...userData };
//   db.write();
// };

export const getUser = (email) => {
  const user = db.data.users.filter((user) => user.email === email);
  console.log(user.length);
  if (user.length === 0) return null;
  return user[0];
};

export const getUserIdx = (email) => {
  const userIdx = db.data.users.indexOf((user) => user.email === email);
  if (userIdx === -1) return null;
  return userIdx;
};
