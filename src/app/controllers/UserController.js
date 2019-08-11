import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const userExists = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (userExists) {
      return res.status(400).json(userExists);
    }
    const user = await User.create(req.body);
    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string()
        .min(6)
        .when('oldPass', (oldPass, field) =>
          oldPass ? field.required() : field
        ),
      oldPass: Yup.string().min(6),
      confirmPassword: Yup.string()
        .min(6)
        .when('password', (password, field) =>
          password ? field.required().oneOf([Yup.ref('password')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, oldPass } = req.body;
    let user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({
        where: {
          email,
        },
      });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    if (oldPass && !(await user.checkPass(oldPass))) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    user = await user.update(req.body);

    return res.json(user);
  }
}

export default new UserController();
