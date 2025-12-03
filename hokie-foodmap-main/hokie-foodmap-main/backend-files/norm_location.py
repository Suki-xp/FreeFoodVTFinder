import json
import re

VT_PLACES = {
    'squires': 'Squires Student Center, Virginia Tech, Blacksburg, VA',
    'graduate life center': 'Graduate Life Center, Virginia Tech, Blacksburg, VA',
    'glc': 'Graduate Life Center, Virginia Tech, Blacksburg, VA',
    'women\'s center': '206 Washington St SW, Blacksburg, VA 24060',
    'hitt': '1385 Perry St, Blacksburg, VA 24060',
    'whittemore': 'Whittemore Hall, Virginia Tech, Blacksburg, VA',
    'apida + center': 'Squires Student Center, Virginia Tech, Blacksburg, VA',
    'deet\'s place': 'Deet\'s Place, Virginia Tech, Blacksburg, VA',
    'cheatham': 'Cheatham Hall, Virginia Tech, Blacksburg, VA',
    'breakzone': 'BreakZone, Squires Student Center, Virginia Tech, Blacksburg, VA',
    'the hop': 'The HOP, 505 N Main St, Blacksburg, VA',
    'perspectives gallery': 'Perspectives Gallery, Squires Student Center, Virginia Tech, Blacksburg, VA',
    'turner place': 'Turner Place, Virginia Tech, Blacksburg, VA',
    'pride center': 'Pride Center, Squires Student Center, Virginia Tech, Blacksburg, VA',
    'food science': 'Food Science Building, Virginia Tech, Blacksburg, VA',
    'newman library': 'Newman Library, Virginia Tech, Blacksburg, VA',
    'haymarket': 'Haymarket Theatre, Squires Student Center, Virginia Tech, Blacksburg, VA',
    'lyric': 'Lyric Theatre, 135 College Ave, Blacksburg, VA',
    'goodwin': 'Goodwin Hall, Virginia Tech, Blacksburg, VA',
    'boeing auditorium': 'Boeing Auditorium, Academic Building One, Virginia Tech, Blacksburg, VA',
    'academic building one': 'Academic Building One, Virginia Tech, Blacksburg, VA',
    'o\'shaughnessy': 'O\'Shaughnessy Hall, Virginia Tech, Blacksburg, VA',
    'holtzman alumni center': 'Holtzman Alumni Center, Virginia Tech, Blacksburg, VA',
    'norris': 'Norris Hall, Virginia Tech, Blacksburg, VA',
    'payne hall': 'Payne Hall, Virginia Tech, Blacksburg, VA',
    'hefun': 'Hefun Restaurant, Blacksburg, VA',
    'slusher': 'Slusher Hall, Virginia Tech, Blacksburg, VA',
    'indigenous community garden': 'Indigenous Community Garden, Virginia Tech, Blacksburg, VA',
    'east aj': 'East AJ, Virginia Tech, Blacksburg, VA',
    'studio 72': 'Studio 72, Virginia Tech, Blacksburg, VA',
    'harper hall': 'Harper Hall, Virginia Tech, Blacksburg, VA',
    'commonwealth ballroom': 'Commonwealth Ballroom, Squires Student Center, Virginia Tech, Blacksburg, VA',
    'center for inclusivity': 'Center for Inclusivity, Virginia Tech, Blacksburg, VA',
    'center for the arts': 'Moss Arts Center, Virginia Tech, Blacksburg, VA',
    'johnston': 'Johnston Student Center, Virginia Tech, Blacksburg, VA',
    'kelly hall': 'Kelly Hall, Virginia Tech, Blacksburg, VA',
    'durham': 'Durham Hall, Virginia Tech, Blacksburg, VA',
    'gilbert place': 'Gilbert Place, Virginia Tech, Blacksburg, VA',
    'mcb': 'McBryde Hall, Virginia Tech, Blacksburg, VA',
    'surge space': 'Surge Space, Virginia Tech, Blacksburg, VA',
    'bcc': 'Black Cultural Center, Squires Student Center, Virginia Tech, Blacksburg, VA',
}

#remove room floor and other details
def extractBuildingName(location):
    if not location:
        return ""
    s = str(location).strip()

    #remove the ()
    if s.startswith("(") and s.endswith(")"):
        s = s[1:-1].strip()

    patterns = [
        r'\s*Rm\.?\s*\d+.*$',      # Rm 350, Rm.350
        r'\s*Room\s*\d+.*$',       # Room 500
        r'\s*#\d+.*$',             # #123
        r'\s*\d{1,4}[A-Z]?$',      # trailing numeric room codes
        r'\s*Floor\s*\d+.*$',
        r'\s*-\s*.*$',
        r',.*$',
    ]
    for p in patterns:
        s = re.sub(p, '', s, flags=re.I).strip()

    return s

def expandLocation(location):
    if not location:
        return ""

    formattedLocation = location.lower().strip()

    for key, address in VT_PLACES.items():
        if key in formattedLocation:
            return address
    if 'va' not in formattedLocation:
        return f"{location}, Blacksburg, VA"
    return location

#normalize all locations
def norm_location(input, applyChanges = False):
    with open(input, 'r', encoding='utf-8') as f:
        data = json.load(f)

    attribute = "location"

    #figure out container with events
    if isinstance(data, dict) and isinstance(data.get("events"), list):
        events = data["events"]
        container = data
    else:
        events = data
        container = events

    total = len(events)
    changed = 0
    samples = []

    #parse location for each event block
    for ev in events:
        if not isinstance(ev, dict):
            continue

        oldLocation = ev.get(attribute, "") or ""
        newLocation = extractBuildingName(oldLocation)
        expandedLocation = expandLocation(newLocation)
        if expandedLocation != oldLocation:
            changed += 1
            samples.append({
                "old": oldLocation, 
                "new": newLocation,
                "expanded": expandedLocation,
                })
        ev[attribute] = expandedLocation

    # write results if requested
    if applyChanges:
        with open(input,'w', encoding='utf-8') as f:
            json.dump(container, f, ensure_ascii=False, indent=2)

    return {"total_events": total, 
            "changed": changed, 
            "samples": samples[:10]
    }