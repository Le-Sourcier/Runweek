const { Users, FriendRequest, Friend } = require('../../models');
const { Op } = require('sequelize');

const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ error: true, message: 'You cannot send a friend request to yourself.' });
    }

    const existingRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      },
    });

    if (existingRequest) {
      return res.status(400).json({ error: true, message: 'A friend request already exists between you and this user.' });
    }

    const areFriends = await Friend.findOne({
      where: {
        [Op.or]: [
          { user_id: senderId, friend_id: receiverId },
          { user_id: receiverId, friend_id: senderId },
        ],
      },
    });

    if (areFriends) {
        return res.status(400).json({ error: true, message: 'You are already friends with this user.' });
    }

    const friendRequest = await FriendRequest.create({
      sender_id: senderId,
      receiver_id: receiverId,
    });

    return res.status(201).json({ error: false, message: 'Friend request sent successfully', data: { friendRequest } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "An error occurred while sending the friend request.",
    });
  }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findByPk(requestId);

        if (!friendRequest || friendRequest.receiver_id !== userId) {
            return res.status(404).json({ error: true, message: 'Friend request not found or you are not the receiver.' });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ error: true, message: `This friend request is already ${friendRequest.status}.` });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        await Friend.create({
            user_id: friendRequest.sender_id,
            friend_id: friendRequest.receiver_id,
            status: 'accepted',
        });

        return res.status(200).json({ error: false, message: 'Friend request accepted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'An error occurred while accepting the friend request' });
    }
};

const declineFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findByPk(requestId);

        if (!friendRequest || friendRequest.receiver_id !== userId) {
            return res.status(404).json({ error: true, message: 'Friend request not found or you are not the receiver.' });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ error: true, message: `This friend request is already ${friendRequest.status}.` });
        }

        friendRequest.status = 'declined';
        await friendRequest.save();

        return res.status(200).json({ error: false, message: 'Friend request declined successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'An error occurred while declining the friend request' });
    }
};

const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const friends = await Friend.findAll({
            where: {
                [Op.or]: [{ user_id: userId }, { friend_id: userId }],
                status: 'accepted',
            },
            include: [
                { model: Users, as: 'user', attributes: ['id', 'email'] },
                { model: Users, as: 'friend', attributes: ['id', 'email'] },
            ],
        });

        const friendList = friends.map(friendship => {
            if (friendship.user_id === userId) {
                return friendship.friend;
            } else {
                return friendship.user;
            }
        });

        return res.status(200).json({ error: false, message: "Friends list retrieved successfully", data: { friends: friendList } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'An error occurred while retrieving the friends list' });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const friendRequests = await FriendRequest.findAll({
            where: {
                receiver_id: userId,
                status: 'pending',
            },
            include: [
                { model: Users, as: 'sender', attributes: ['id', 'email'] },
            ],
        });

        return res.status(200).json({
            error: false,
            message: "Friend requests retrieved successfully",
            data: { friendRequests },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "An error occurred while retrieving friend requests.",
            data: { error: error.message },
        });
    }
};


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getFriendRequests,
};