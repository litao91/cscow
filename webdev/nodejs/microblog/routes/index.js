var User = require('../models/user.js');
var Post = require('../models/post.js');
var crypto = require('crypto')
module.exports = function(app) {
    // homepage
    app.get('/', function(req, res) {
        Post.get(null, function(err, posts) {
            if(err) {
                posts = [];
            }
            res.render('index', {
                title: 'Home Page',
                posts: posts
            });
        });
    });
    // load the registration form
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: 'Registration'
        });
    });
    // when user post the form
    app.post('/reg', function(req, res) {
        if (req.body['password-repeat'] != req.body['password']) {
            req.session.error = ["Password don't agree"]
            return res.redirect('/reg');
        }

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var newUser = new User({
            name: req.body.username,
            password: password
        });
        User.get(newUser.name, function(err, user) {
            if(user) {
                err = 'Username already exists.';
            }
            if(err) {
                req.session.error = [err];
                return res.redirect('/reg');
            }

            newUser.save(function(err) {
                if(err) {
                    req.session.error = [err];
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.session.success = ['Regsiteration success'];
                res.redirect('/');
            });
        });
    });

    app.get('/login', function(req, res) {
        res.render('login', {
            title: "User Login"
        });
    });

    app.get('login', checkNotLogin);
    app.post('/login', function(req, res) {
        var md5 = crypto.createHash('md5');
        var password =
            md5.update(req.body.password).digest('base64');
        User.get(req.body.username, function(err, user) {
            if(!user) {
                req.session.error = ['User not exists'];
                return res.redirect('/login');
            }
            if(user.password != password) {
                req.session.error = ['Incorrect Password'];
                return res.redirect('/login');
            }

            req.session.user = user;
            req.session.success = ['Login success'];
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.session.success = ['Logout success'];
        res.redirect('/');
    });


    app.post('/post', checkLogin);
    app.post('/post', function(req, res) {
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.post);
        post.save(function(err) {
            if(err) {
                req.session.error = [err];
                return res.redirect('/');
            }
            req.session.success = ["Post success"]
            res.redirect('/u/' + currentUser.name);
        });
    });

    app.get('/u/:user', function(req, res) {
        User.get(req.params.user, function(err, user) {
            if(!req.session.user) {
                req.session.error = ["User doesn't exist"];
                return res.redirect('/');
            }
            Post.get(user.name, function(err, posts) {
                if(err) {
                    req.session.error = err;
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts
                });
            });
        });
    });
};

function checkLogin(req, res, next) {
    if(!req.session.user) {
        req.session.error = ["Not logged in"];
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.session.erro = ["Already logged in"];
        return res.redirect('/');
    }
    next();
}
