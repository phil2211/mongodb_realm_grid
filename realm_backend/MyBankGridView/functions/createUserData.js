exports = async function(authEvent) {
  const mongodb = context.services.get("mongodb-atlas");
  const users = mongodb.db("mybank").collection("users");
  const { user, time } = authEvent;
  const newUser = { 
    _id: authEvent.user.id,
    email: authEvent.user.email,
    created: time,
    roles: []
  };
  return await users.insertOne(newUser);
}