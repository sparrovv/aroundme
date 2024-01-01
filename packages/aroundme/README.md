# Around me Report


This library finds interesting POIs around a location. Then it finds how far the location is from a landmark. 

It also scores the location based on its proximity to places defined by the system.

## Score my location

This app scores the location based on its proximity to places defined by the system.

The list of places and the score is defined by arbitrary rules, that will be easy to change.

The basic algorithm is:

If the location is within X minutes walking distance to any of the places, it gets the score for that place.
If the location is not within X minutes walking distance to any of the above places, it gets no score.

If there are multiple places of the same type within X minutes walking distance, the location gets half the score for the 2nd place.


This algorithm is one of many that can be applied.