import passport from 'passport';
import passportJwt from 'passport-jwt';

const { ExtractJwt } = passportJwt;
const StrategyJwt = passportJwt.Strategy;
import {models} from "../models/"

export default passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    ((jwtPayload, done) => models.User.findOne({ where: { id: jwtPayload.id } })
      .then((user : any) => done(null, user))
      .catch((err : any) => done(err)))
  )
);
