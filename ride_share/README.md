# Ride Share Playground

I made this to get some hands on experience/practice with doing a full System Design of a popular interview question, I levelled up in several areas working on the various pieces so feel free to copy and try if you'd like but you might learn more by doing it yourself.

What works:

* Posting lat/long to Redis.
* Creating/Updating rides in Postgres.
* Registering a driver in Redis.
* Activating a ride (aka, time to look for a driver)
* ~~Pub/Sub via Redis for ride activation.~~ Kafka Queue for ride activation.
* Ride match with exanding radius.
* FAKED: driver accept/decline via Rand()
* Locking driver to keep from getting pinged when offering ride.
* Cleaning out locations.
  
Lots of other things *could* be added, but I'm not trying to start a competing service, just playing around and learning stuff.  

Have fun!