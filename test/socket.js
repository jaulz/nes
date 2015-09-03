// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Nes = require('../');
var Ws = require('ws');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Socket', function () {

    describe('send()', function () {

        it('errors on invalid message', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.register({ register: Nes, options: {} }, function (err) {

                expect(err).to.not.exist();

                server.start(function (err) {

                    var client = new Ws('http://localhost:' + server.info.port);

                    client.on('message', function (data, flags) {

                        var message = JSON.parse(data);
                        expect(message.statusCode).to.equal(500);
                        expect(message.type).to.equal('broadcast');

                        client.close();
                        server.stop(done);
                    });

                    client.on('open', function () {

                        var a = { b: 1 };
                        a.c = a;                    // Circular reference

                        server.broadcast(a);
                    });
                });
            });
        });
    });

    describe('onMessage()', function () {

        it('errors on invalid request message', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.register({ register: Nes, options: {} }, function (err) {

                expect(err).to.not.exist();

                server.route({
                    method: 'GET',
                    path: '/',
                    handler: function (request, reply) {

                        return reply('hello');
                    }
                });

                server.start(function (err) {

                    var client = new Ws('http://localhost:' + server.info.port);

                    client.on('message', function (data, flags) {

                        var message = JSON.parse(data);
                        expect(message.payload).to.deep.equal({
                            statusCode: 400,
                            error: 'Bad Request',
                            message: 'Cannot parse message'
                        });

                        expect(message.statusCode).to.equal(400);

                        client.close();
                        server.stop(done);
                    });

                    client.on('open', function () {

                        client.send('{', function (err) {

                            expect(err).to.not.exist();
                        });
                    });
                });
            });
        });

        it('errors on missing id', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.register({ register: Nes, options: {} }, function (err) {

                expect(err).to.not.exist();

                server.route({
                    method: 'GET',
                    path: '/',
                    handler: function (request, reply) {

                        return reply('hello');
                    }
                });

                server.start(function (err) {

                    var client = new Ws('http://localhost:' + server.info.port);

                    client.on('message', function (data, flags) {

                        var message = JSON.parse(data);
                        expect(message.payload).to.deep.equal({
                            statusCode: 400,
                            error: 'Bad Request',
                            message: 'Message missing id'
                        });

                        expect(message.statusCode).to.equal(400);
                        expect(message.type).to.equal('response');

                        client.close();
                        server.stop(done);
                    });

                    client.on('open', function () {

                        client.send(JSON.stringify({ type: 'request', method: 'GET', path: '/' }), function (err) {

                            expect(err).to.not.exist();
                        });
                    });
                });
            });
        });

        it('errors on missing method', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.register({ register: Nes, options: {} }, function (err) {

                expect(err).to.not.exist();

                server.route({
                    method: 'GET',
                    path: '/',
                    handler: function (request, reply) {

                        return reply('hello');
                    }
                });

                server.start(function (err) {

                    var client = new Ws('http://localhost:' + server.info.port);

                    client.on('message', function (data, flags) {

                        var message = JSON.parse(data);
                        expect(message.payload).to.deep.equal({
                            statusCode: 400,
                            error: 'Bad Request',
                            message: 'Message missing method'
                        });

                        expect(message.statusCode).to.equal(400);
                        expect(message.type).to.equal('response');

                        client.close();
                        server.stop(done);
                    });

                    client.on('open', function () {

                        client.send(JSON.stringify({ id: 1, type: 'request', path: '/' }), function (err) {

                            expect(err).to.not.exist();
                        });
                    });
                });
            });
        });

        it('errors on missing path', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.register({ register: Nes, options: {} }, function (err) {

                expect(err).to.not.exist();

                server.route({
                    method: 'GET',
                    path: '/',
                    handler: function (request, reply) {

                        return reply('hello');
                    }
                });

                server.start(function (err) {

                    var client = new Ws('http://localhost:' + server.info.port);

                    client.on('message', function (data, flags) {

                        var message = JSON.parse(data);
                        expect(message.payload).to.deep.equal({
                            statusCode: 400,
                            error: 'Bad Request',
                            message: 'Message missing path'
                        });

                        expect(message.statusCode).to.equal(400);

                        client.close();
                        server.stop(done);
                    });

                    client.on('open', function () {

                        client.send(JSON.stringify({ id: 1, type: 'request', method: 'GET' }), function (err) {

                            expect(err).to.not.exist();
                        });
                    });
                });
            });
        });

        it('errors on unknown type', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.register({ register: Nes, options: {} }, function (err) {

                expect(err).to.not.exist();

                server.route({
                    method: 'GET',
                    path: '/',
                    handler: function (request, reply) {

                        return reply('hello');
                    }
                });

                server.start(function (err) {

                    var client = new Ws('http://localhost:' + server.info.port);

                    client.on('message', function (data, flags) {

                        var message = JSON.parse(data);
                        expect(message.payload).to.deep.equal({
                            statusCode: 400,
                            error: 'Bad Request',
                            message: 'Unknown message type'
                        });

                        expect(message.statusCode).to.equal(400);

                        client.close();
                        server.stop(done);
                    });

                    client.on('open', function () {

                        client.send(JSON.stringify({ id: 1, type: 'unknown' }), function (err) {

                            expect(err).to.not.exist();
                        });
                    });
                });
            });
        });
    });
});