# Web Session
The session is a key-value pair data structure. Think of it as a hashtable
where each user gets a hashkey to put their data in.

The general principle is that you, as the client, give the server your
session id, and in return the server grants you access to your session
data.

Start from the moment when we load a webpage

1. When you receive a web a webpage from server, along with page content
  itself, the server sent you (in general in a cookie) the session id that
  it set to identify your connection among all the requests that it gets.
* After you logged in, the application validated your password and login
  and saved your user id in the session so that every time you will make a
  request, you won't have to log in again.
* You send a http request to the server asking for a page. Along with http
  request, you send your session id. The session id is usually sent in
  cookies. But it can also be sent in `GET` or `POST` parameters.
* The server receives your request. Before it gives you your page, it
  checks your session id, looks up in its session datastore, and make the
  data in the entry available to the code engine. (php, java, ruby...)
* The server then executes the code corresponding to your request. 
* The code starts by getting your user id from the session made available
  by the server earlier, then it uses it to query the database.
* Finally it creates a html page, puts your data in, and hands it to the
  server
* The server sends your drafts page, along with your session id.


Sessions keep you logged in while you are connected to the server.
Basically, after you logged in the first, the server remembers in the
session that this is really you and lets you ask for more data without
asking again who you are.

## Cookie
A cookie is a small piece of data sent from a website and stored in a
user's web browser while the user is browsing that website. 

Every time the user loads the website, the browser sends the cookie back
to the server to notify the website of the user's previous activity.
