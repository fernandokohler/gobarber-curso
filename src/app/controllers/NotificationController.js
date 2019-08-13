import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const checkUserProviders = await User.findOne({
      where: { id: req.userId, providers: true },
    });

    if (!checkUserProviders) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    return res.json();
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
