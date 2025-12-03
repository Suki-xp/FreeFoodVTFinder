#script for converting addresses to latitude and longitude using geoapify

#take from events.json to populate map points

#need requests installed within the env before run

import json
import requests
import time
import os
from norm_location import norm_location

GEOAPIFY_API_KEY = 'b808667cbca3440ca7f9e90c0624625c'
BB_COORD = {'lat': 37.2301, 'lon': -80.4151}


def static_map(lon, lat):

    os.makedirs("static_maps", exist_ok=True)
    newMap = f"{lon}_{lat}.png"
    mapPath = os.path.join("static_maps", newMap).replace("\\", "/")

    query = "https://maps.geoapify.com/v1/staticmap"
    parameters = {
        "apiKey": GEOAPIFY_API_KEY,
        "style": "osm-bright",
        "width": 800,
        "height": 600,
        "format": "png",
        "center": f"lonlat:{lon},{lat}",
        "marker": f"lonlat:{lon},{lat}",
    }

    req = requests.get(query, params=parameters, timeout=10)

    #create new file ref and write static map contents
    with open(mapPath, "wb") as f:
        f.write(req.content)
    return mapPath

#geocode each event based on biasing for Blacksburg
def geocode_address(location):
    
    query = "https://api.geoapify.com/v1/geocode/search"
    parameters = {
        "text": location,
        "apiKey": GEOAPIFY_API_KEY,
        "bias":f'proximity:{BB_COORD["lon"]},{BB_COORD["lat"]}',
        "limit":1,
    }

    try:
        req = requests.get(query, params=parameters, timeout=10)
        print("RAW RESPONSE:", req.text)
        data = req.json()


        if data.get("features"):
            attributes = data.get("features")[0]["properties"]
            return {
                'lon': attributes['lon'],
                'lat': attributes['lat'],
                'formatted': attributes['formatted'],
                'staticMap': static_map(attributes['lon'], attributes['lat']),
            }
    
    except:
        pass

    return None 

#looper for geocoding each event's addr in events.json for each bracketed event item
def geocode_all_events(file='events.json'):
    norm_location(file, applyChanges=True)

    with open(file, 'r', encoding='utf-8') as f:
        events = json.load(f)

    #loop for each event to geocode
    for i, event in enumerate(events):
        location = event.get('location', '')
        title = event.get('title')
        #check for location
        if not location:
            event['geocoding'] = None
        else:
                location = location.strip()
                geocoding = geocode_address(location)
                print("GOT:", geocoding)
                event['geocoding'] = geocoding



        #delay each loop for the API
        time.sleep(0.1)

    with open(file, 'w', encoding='utf-8') as f:
        json.dump(events, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    geocode_all_events()

        
    