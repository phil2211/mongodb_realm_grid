exports = async function(custom_data) {
  try {
    const callingUser = context.user;

    // The user custom data contains a canReadPartitions array that is managed
    // by a system function.
    const { role } = callingUser.custom_data;
    
    console.log(JSON.stringify(callingUser));
    console.log(JSON.stringify(custom_data));
    
    // If the user's canReadPartitions array contains the partition, they may read the partition
    return role && role === "consultant"

  } catch (error) {
    console.error(error);
    return false;
  }
};
