import User from '../models/user.model.js';

/**
 * Fetch users for initiating new chats.
 * Excludes the calling user.
 */
export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user.id;

    let query = { _id: { $ne: currentUserId } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('name phone email profileImage status');
    return res.json({ status: 'success', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};

/**
 * Update current user profile.
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, status, location, profileImage } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(status !== undefined && { status }),
        ...(location !== undefined && { location }),
        ...(profileImage !== undefined && { profileImage }),
      },
      { new: true }
    ).select('name phone email location profileImage status');

    return res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
};

/**
 * Fetch a user profile by ID.
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('name phone email location profileImage status');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.json({ status: 'success', user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch user profile' });
  }
};
