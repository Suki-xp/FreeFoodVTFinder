#Web Scraper
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException
from bs4 import BeautifulSoup
import time
import re
import json
import schedule

def gettingInfo():
    #Sets up Chrome options
    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')

    #Webdriver
    driver = webdriver.Chrome(options=options)

    #Pulls the gobblerconnect page that filters events for free food
    driver.get('https://gobblerconnect.vt.edu/events?perks=FreeFood')
    time.sleep(1) 

    #Repeatedly clicks the "Load More" button to load all events
    while True:
        try:
            load_more_btn = driver.find_element(By.XPATH, "//button[.//span[text()='Load More']]")
            load_more_btn.click()
            time.sleep(2)
        except(NoSuchElementException, ElementClickInterceptedException):
            break

    #Collects all the urls first that were loaded on the front page (not info scrapping front page)
    event_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/event/']")
    event_urls = []
    for link in event_links:
        href = link.get_attribute('href')
        
        if href and '/event/' in href:
            full_url = href if href.startswith('http') else 'https://gobblerconnect.vt.edu' + href
            event_urls.append(full_url)

    print(f"Found {len(event_urls)} events") 
    #Total number of events loaded to scrap within

    event_details = []

    for event_url in event_urls:
        driver.get(event_url)
        time.sleep(3)

        soup = BeautifulSoup(driver.page_source, 'html.parser')

        #Description text that it finds by going through html
        detail_text = soup.find('div', class_='DescriptionText')
        event_text = detail_text.get_text(strip=True, separator="\n") if detail_text else ""
        
        #Now we want to loop through and avoid picking up random words like the free perks
        removing_info = []
        not_keywords = ['perks', 'free food', "free stuff", "categories"]
        
        #Cleans up the uncessary info that shouldn't be in description
        for clear_line in event_text.split("\n"):
            if not any (words in clear_line.lower() for words in not_keywords):
                removing_info.append(clear_line)
            else:
                break
        event_text = "\n".join(removing_info).strip()
        
        #Form links on each card 
        info_urls = []
        keywords = ['form', 'register', 'sign up', 'rsvp', 'link']
        for a in soup.find_all('a', href=True):
            href = a['href']
            text = a.get_text(strip=True).lower()
            
            full_url = href if href.startswith('http') else 'https://gobblerconnect.vt.edu' + href
            #check against the keywords in the array to then add to the full url
            if any(k in text for k in keywords):
                info_urls.append({"label": a.get_text(strip=True), "url": full_url})

        event_details.append({
            "url": event_url,
            "Description": event_text,
            "info_urls": info_urls
        })

    #Adds the events to a json file for use in React App
    with open("events_details.json", "w", encoding="utf-8") as f:
        json.dump(event_details, f, ensure_ascii=False, indent=4)

    #Check to make sure events were saved
    print(f"Saved {len(event_details)} events to events_details.json")
    
    schedule.every(15).minutes.do(gettingInfo)

if __name__ == "__main__":
    gettingInfo()
    while True:
        schedule.run_pending()
        time.sleep(1)