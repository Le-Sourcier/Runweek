const { Users, FriendRequest, Friend } = require('../../models');
const serverMessage = require('../../utils/components/serverMessage');
const { Op } = require('sequelize');

const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return serverMessage(res, 400, { error: 'You cannot send a friend request to yourself.' });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      },
    });

    if (existingRequest) {
      return serverMessage(res, 400, { error: 'A friend request already exists between you and this user.' });
    }

    // Check if they are already friends
    const areFriends = await Friend.findOne({
      where: {
        [Op.or]: [
          { user_id: senderId, friend_id: receiverId },
          { user_id: receiverId, friend_id: senderId },
        ],
      },
    });

    if (areFriends) {
        return serverMessage(res, 400, { error: 'You are already friends with this user.' });
    }

    const friendRequest = await FriendRequest.create({
      sender_id: senderId,
      receiver_id: receiverId,
    });

    serverMessage(res, 201, 'Friend request sent successfully', { friendRequest });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while sending the friend request' });
  }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findByPk(requestId);

        if (!friendRequest || friendRequest.receiver_id !== userId) {
            return serverMessage(res, 404, { error: 'Friend request not found or you are not the receiver.' });
        }

        if (friendRequest.status !== 'pending') {
            return serverMessage(res, 400, { error: `This friend request is already ${friendRequest.status}.` });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Create the friendship
        await Friend.create({
            user_id: friendRequest.sender_id,
            friend_id: friendRequest.receiver_id,
            status: 'accepted',
        });

        serverMessage(res, 200, 'Friend request accepted successfully');

    } catch (error) {
        console.error(error);
        serverMessage(res, 500, { error: 'An error occurred while accepting the friend request' });
    }
};

const declineFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findByPk(requestId);

        if (!friendRequest || friendRequest.receiver_id !== userId) {
            return serverMessage(res, 404, { error: 'Friend request not found or you are not the receiver.' });
        }

        if (friendRequest.status !== 'pending') {
            return serverMessage(res, 400, { error: `This friend request is already ${friendRequest.status}.` });
        }

        friendRequest.status = 'declined';
        await friendRequest.save();

        serverMessage(res, 200, 'Friend request declined successfully');

    } catch (error) {
        console.error(error);
        serverMessage(res, 500, { error: 'An error occurred while declining the friend request' });
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

        serverMessage(res, 200, 'Friends list retrieved successfully', { friends: friendList });

    } catch (error) {
        console.error(error);
        serverMessage(res, 500, { error: 'An error occurred while retrieving the friends list' });
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

        serverMessage(res, 200, 'Friend requests retrieved successfully', { friendRequests });

    } catch (error) {
        console.error(error);
        serverMessage(res, 500, { error: 'An error occurred while retrieving friend requests' });
    }
};


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getFriendRequests,
};