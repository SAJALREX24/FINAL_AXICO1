// Medical cartoon avatar - Happy Doctor
const HAPPY_DOCTOR_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/63efdd01-ddd2-4f30-9bfd-9187efddd23c/images/c7303f0ae0dd30a13050ef9fce5c6b59d900cb27813cbc38b88b26535d78b6d6.png';

// Get a consistent avatar based on user ID or email
export const getMedicalAvatar = (userId, email) => {
  // Return the happy doctor cartoon avatar for all logged-in users
  return HAPPY_DOCTOR_AVATAR;
};

// Get avatar with specific style (returns happy doctor)
export const getAvatarBySeed = (seed) => {
  return HAPPY_DOCTOR_AVATAR;
};

export default HAPPY_DOCTOR_AVATAR;
