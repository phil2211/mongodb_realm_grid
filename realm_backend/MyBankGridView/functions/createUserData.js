exports = async function(authEvent) {
  const mongodb = context.services.get("mongodb-atlas");
  const users = mongodb.db("mybank").collection("users");
  const { user } = authEvent;
  const newUser = { _id: authEvent.user.id, created: time, roles: [] };
  await users.insertOne(newUser);
}