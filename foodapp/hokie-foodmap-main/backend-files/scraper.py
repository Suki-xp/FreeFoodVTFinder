#Web Scraper
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException
from bs4 import BeautifulSoup
import time
import re
import json
import schedule

def running_scrapper():
    #Sets up Chrome options
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')

    #Webdriver
    driver = webdriver.Chrome(options=options)

    #Pulls the gobblerconnect page that filters events for free food
    driver.get('https://gobblerconnect.vt.edu/events?perks=FreeFood')
    time.sleep(3) #Holds to let JS load

    #Repeatedly clicks the "Load More" button to load all events
    while True:
        try:
            load_more_btn = driver.find_element(By.XPATH, "//button[.//span[text()='Load More']]")
            load_more_btn.click()
            time.sleep(2)
        except(NoSuchElementException, ElementClickInterceptedException):
            break

    #Parses the page once loaded
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    #Filters the HTML for specifically the event cards that holds each event
    event_cards = soup.find_all('div', class_="MuiPaper-root MuiCard-root MuiPaper-elevation3 MuiPaper-rounded")

    events = []

    #Loops through each card
    for card in event_cards:
        #Finds the div tags that have svg tags in them, indicating text
        info_divs = [d for d in card.find_all('div') if d.find('svg')]

        raw_text = info_divs[0].get_text(strip=True)
        #Splits to concatenate after the time
        raw_text = re.sub(r'(EDT|EST|CDT|CST|PDT|PST)([A-Z])', r'\1 \2', raw_text)

        #Extracts the date + time and then the rest of the text
        match = re.search(
            r'([A-Za-z]+,\s+[A-Za-z]+\s+\d+\s+at\s+\d+:\d+\s*[AP]M\s*(?:EDT|EST|CDT|CST|PDT|PST))\s*(.*)',
            raw_text)
       
        if match:
            date_text = match.group(1).strip()
            remaining_text = match.group(2).strip()

        else:
            date_text = raw_text
            remaining_text = "N/A"

        #Splits the location and the hosting org(s) so that they can be written to two seperate lines
        host_span = card.select_one('div[style*="min-height: 1.625rem;"] span')
        host_text = host_span.get_text(strip=True) if host_span else "N/A"

        location_text = remaining_text.replace(host_text, '').strip() if remaining_text != "N/A" else "N/A"

        #Appends events to the events list for the json file
        events.append({
            "date": date_text,
            "location": location_text,
            "hosted_by": host_text
        })

    #Adds the events to a json file for use in React App
    with open("events.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=4)

    #Check to make sure events were saved
    print(f"Saved {len(events)} events to events.json")

#Schedules the scraping to run every 15 minutes
schedule.every(15).minutes.do(running_scrapper)

while True:
    schedule.run_pending()
    time.sleep(1)