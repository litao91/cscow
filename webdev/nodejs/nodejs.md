# Node.JS

## `app.configure([env], callback)`

Conditionally invoke `callback` when `env` matches. These functions are
**not** required in order to use `app.set()`

```javascript
// all environments
app.configure(function(){
  app.set('title', 'My Application');
})

// development only
app.configure('development', function(){
  app.set('db uri', 'localhost/dev');
})

// production only
app.configure('production', function(){
  app.set('db uri', 'n.n.n.n/prod');
})
```

It's effectively the sugar for:

```javascript
// all environments
app.set('title', 'My Application');

// development only
if ('development' == app.get('env')) {
  app.set('db uri', 'localhost/dev');
}

// production only
if ('production' == app.get('env')) {
  app.set('db uri', 'n.n.n.n/prod');
}
```

## `app.use([path], function)`
Use the given middleware `function`, with optional mount `path`

The `mount` path is **not** visible to the middleware. The main effect of
this feature is that mounted middleware may operate without code chnages
regardless of its "prefix" path name.

