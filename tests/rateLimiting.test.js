const chai = require('chai');
const supertest = require('supertest');
const app = require('../server'); 

const expect = chai.expect;
const request = supertest(app);


describe('Rate Limiting', () => {
    it('should allow requests within the rate limit', (done) => {
      request.get('/api/notifications')
        .set('x-client-id', '0055')
        .expect(200)
        .expect((res) => {
        expect(res.body).to.have.property('message', 'Notification sent successfully!!!');
        })
        .end(done);
    });

    it('should reject requests when the per-second rate limit is exceeded', (done) => {
      // Simulate exceeding the per-second rate limit
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          request.get('/api/notifications')
            .set('x-client-id', '0055')
            .expect(429)
        );
      }
  
      Promise.all(requests)
        .then((results) => {
          results.forEach((res) => {
            expect(res.body).to.have.property('error', 'Too many requests per second');
          });
          done();
        })
        .catch(done);
    });
  
    it('should reject requests when the per-month rate limit is exceeded', (done) => {
        // Simulate exceeding the per-month rate limit
        const requests = [];
        for (let i = 0; i < 35; i++) { // Adjust the number of requests to exceed the per-month limit (e.g., 105)
          requests.push(
            request.get('/api/notifications')
              .set('x-client-id', '0055')
              .expect(429)
          );
        }
      
        Promise.all(requests)
          .then((results) => {
            results.forEach((res) => {
              expect(res.body).to.have.property('error', 'Too many requests per month');
            });
            done();
          })
          .catch(done);
      });
      
  
    it('should reject requests when the system rate limit is exceeded', (done) => {
      // Simulate exceeding the system rate limit
      const requests = [];
      for (let i = 0; i < 25; i++) {
        requests.push(
          request.get('/api/notifications')
            .set('x-client-id', '0055')
            .expect(503)
        );
      }
  
      Promise.all(requests)
        .then((results) => {
          results.forEach((res) => {
            expect(res.body).to.have.property('error', 'Service unavailable');
          });
          done();
        })
        .catch(done);
    });
  
    // it('should reject unauthorized requests', (done) => {
    //   request.get('/api/notifications')
    //     .expect(401)
    //     .end((err, res) => {
    //       if (err) return done(err);
    //       expect(res.body).to.have.property('error', 'Unauthorized');
    //       done();
    //     });
    // });
  });
  