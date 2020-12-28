const request = require('supertest-as-promised');
const chai = require('chai');
const randomize = require('randomatic');
const random = require('random-name');
const app = require('../../index');

const { expect } = chai;
chai.config.includeStack = true;

const register = () => {
  return {
    fullName: `${random.first()} ${random.middle()} ${random.last()}`,
    email: `${random.first() +
      random.middle() +
      random.last()}@student.cse.du.ac.bd`,
    contactNo: `+88${randomize('0', 11)}`,
    password: '12131!@#$%^&*(Aa',
    confirmPassword: '12131!@#$%^&*(Aa',
    transaction: '123456',
  };
};
const randomReg = register();
describe('Account module', () => {
    describe('Auth | Register | Customer', () => {
      it('Customer Registration Done', done => {
        request(app)
          .post('/api/v1/accounts/signup')
          .send(randomReg)
          .expect(201)
          .then(res => {
            done();
          })
          .catch(done);
      });
    });
});

describe('Account module', () => {
    it('Admin Login Done', done => {
      request(app)
        .post('/api/v1/accounts/login')
        .send({
          email: randomReg.email,
          password: randomReg.password,
        })
        .expect(401)
        .then(res => {
          expect(res.body.type).to.equal('VerificationError');
          done();
        })
        .catch(done);
    });
  });