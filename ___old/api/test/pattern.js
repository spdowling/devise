'use strict';

/*var request = require('supertest'),
    should = require('should'),
    app = require('../server');
*/
/*
Order tests as described in the order below describing the routes:

GET    /patterns - FIND ALL PATTERNS
POST   /patterns - CREATE A NEW PATTERN

GET    /patterns/:id - GET A SPECIFIC PATTERN
PUT    /patterns/:id - UPDATE A SPECIFIC PATTERN
DELETE /patterns/:id - DELETE A SPECIFIC PATTERN

GET    /patterns/:id/instances - GET ME ALL INSTANCES FOR THIS PATTERN
POST   /patterns/:id/instances - CREATE A NEW INSTANCE FROM THIS PATTERN
*/

/*
describe('Pattern API', function() {
  describe('GET /patterns', function() {
    describe('when requesting resource /patterns', function() {
      beforeEach(function(done) {
        //
      });
      
      it('should return an array of patterns', function(done) {
        request(app)
        .get('/patterns')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          // check we have an array of items ....
          done();
        });
      });
    });
  });

  describe('POST /patterns', function() {
    describe('when creating a new resource /patterns', function() {
      beforeEach(function(done) {
        //
      });
      
      it('it should respond with 201', function(done) {
        request(app)
        .get('/patterns')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          // check we have an array of items ....
          done();
        });
      });
    });
  });

  describe('GET /patterns/:id', function() {
    describe('when requesting resource /patterns/:id with a valid id', function() {
      it('should return the pattern', function(done) {
        request(app)
        .get('/patterns/' + id)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err)
            return done(err);
          var result = JSON.parse(res.text);
          assert.equal(result._id, id);
          assert.equal(pattern.title, result.title);
          assert.equal(pattern.description, result.description);
          assert.equal(pattern.readyIn, result.readyIn);
          assert.equal(pattern.method, result.method);
          assert.equal(pattern.ingredients.length, result.ingredients.length);
          done();
        });
      });
    });

    describe('when requesting resource /patterns/:id with an non-existent id', function() {
      it('should return 404', function(done) {
        request(app)
        .get('/patterns/99a9a825089ca654ca999999')
        .expect('Content-Type', /json/)
        .expect(404, done);
      });
    });
  });

  describe('POST /patterns', function() {
    describe('when creating a new resource /patterns', function() {
      it('should respond with 201', function(done) {
        var pattern = {
            title: "Waffles"
          , description: 'The best waffles!'
          , readyIn: '20 min'
          , method: 'To make the best waffles do this..'
          , ingredients: [
            { name: 'eggs', amount: '2' },
            { name: 'plain flour', amount: '1 1/3 cups' },
            { name: 'sugar', amount: '2tsp' }
            ]
        };

        request(app)
        .post('/patterns')
        .send(pattern)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          if (err)
            return done(err);
          var result = JSON.parse(res.text);
          assert.equal(pattern.title, result.title);
          assert.equal(pattern.description, result.description);
          assert.equal(pattern.readyIn, result.readyIn);
          assert.equal(pattern.method, result.method);
          assert.equal(pattern.ingredients.length, result.ingredients.length);
          done();
        });
      });
    });

    describe('when recreating an existing pattern', function() {
      it('should respond with 409', function(done) {
        var pattern = {
          title: "Pancakes"
        , description: 'The best waffles!'
        , readyIn: '20 min'
        , method: 'To make the best waffles do this..'
        , ingredients: [
            { name: 'eggs', amount: '2' },
            { name: 'plain flour', amount: '1 1/3 cups' },
            { name: 'sugar', amount: '2tsp' }
          ]
        };
        request(app)
        .post('/patterns')
        .send(pattern)
        .expect('Content-Type', /json/)
        .expect(409, done);
      });
    });

    describe('when sending an invalid request', function() {
      it('should respond with 400', function(done) {
        var pattern = {
            title: ''
          , description: ''
        };
        request(app)
        .post('/patterns')
        .send(pattern)
        .expect('Content-Type', /json/)
        .expect(400, done);
      });
    });
  });

  describe('PUT /patterns/:id', function() {
    var pattern = {
      title: "Hotdogs"
    };

    describe('when updating an existing resource /pattern/:id', function() {
      it('should respond with 204', function(done) {
        request(app)
        .put('/patterns/' + id)
        .send(pattern)
        .expect(204, done);
      });
    });

    describe('when updating an inexistent resource', function() {
      it('should respond with 404', function(done) {
        request(app)
        .put('/patterns/99a9a825089ca654ca999999')
        .send(pattern)
        .expect(404, done);
      });
    });

    describe('when updating a resource with invalid request', function() {
      it('should respond with 400', function(done) {
        request(app)
        .put('/patterns/.')
        .send(pattern)
        .expect(400, done);
      });
    });
  });

  describe('DELETE /patterns/:id', function() {
    describe('when deleting an existing pattern', function() {
      it('should respond with 204', function(done) {
        request(app)
        .del('/patterns/' + id)
        .expect(204, done);
      });
    });

    describe('when deleting a resource with an invalid request', function() {
      it('should respond with 400', function(done) {
        request(app)
        .del('/patterns/.')
        .expect(400, done);
      });
    });

    describe('when deleting an inexistent resource', function() {
      it('should respond with 404', function(done) {
        request(app)
        .del('/patterns/99a9a825089ca654ca999999')
        .expect('Content-Type', /json/)
        .expect(404, done);
      });
    });
  });
});*/