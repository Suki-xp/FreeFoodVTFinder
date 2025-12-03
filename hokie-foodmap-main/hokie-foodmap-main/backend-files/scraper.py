# Combined Scraper
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException
from bs4 import BeautifulSoup
import time
import re
import json
import schedule
from geocoding import geocode_all_events

def scraper_basic_events(driver):
    driver.get('https://gobblerconnect.vt.edu/events?perks=FreeFood')
    time.sleep(1)

    # Load all events
    while True:
        try:
            load_more_btn = driver.find_element(By.XPATH, "//button[.//span[text()='Load More']]")
            load_more_btn.click()
            time.sleep(2)
        except (NoSuchElementException, ElementClickInterceptedException):
            break

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    event_cards = soup.find_all('div', class_="MuiPaper-root MuiCard-root MuiPaper-elevation3 MuiPaper-rounded")
    events = []

    for card in event_cards:
        info_divs = [d for d in card.find_all('div') if d.find('svg')]
        h3_text = card.find('h3')

        raw_text = info_divs[0].get_text(strip=True) if info_divs else ''
        raw_text = re.sub(r'(EDT|EST|CDT|CST|PDT|PST)([A-Z])', r'\1 \2', raw_text)
        match = re.search(
            r'([A-Za-z]+,\s+[A-Za-z]+\s+\d+\s+at\s+\d+:\d+\s*[AP]M\s*(?:EDT|EST|CDT|CST|PDT|PST))\s*(.*)',
            raw_text
        )
        date_text = match.group(1).strip() if match else raw_text
        remaining_text = match.group(2).strip() if match else "N/A"

        host_span = card.select_one('div[style*="min-height: 1.625rem;"] span')
        host_text = host_span.get_text(strip=True) if host_span else "N/A"
        location_text = remaining_text.replace(host_text, '').strip() if remaining_text != "N/A" else "N/A"

        events.append({
            "title": h3_text.get_text(strip=True) if h3_text else "N/A",
            "date": date_text,
            "location": location_text,
            "hosted_by": host_text
        })
    return events

def scraper_event_descriptions(driver):
    driver.get('https://gobblerconnect.vt.edu/events?perks=FreeFood')
    time.sleep(1)

    # Load all events
    while True:
        try:
            load_more_btn = driver.find_element(By.XPATH, "//button[.//span[text()='Load More']]")
            load_more_btn.click()
            time.sleep(2)
        except (NoSuchElementException, ElementClickInterceptedException):
            break

    # Collect all event URLs
    event_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/event/']")
    event_urls = []
    for link in event_links:
        href = link.get_attribute('href')
        if href and '/event/' in href:
            full_url = href if href.startswith('http') else 'https://gobblerconnect.vt.edu' + href
            event_urls.append(full_url)

    details = []
    for event_url in event_urls:
        driver.get(event_url)
        time.sleep(2)
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        detail_text = soup.find('div', class_='DescriptionText')
        event_text = detail_text.get_text(strip=True, separator="\n") if detail_text else ""

        # Remove unwanted lines
        not_keywords = ['perks', 'free food', "free stuff", "categories"]
        lines = [line for line in event_text.split("\n") if not any(k in line.lower() for k in not_keywords)]
        event_text = "\n".join(lines).strip()

        # Form URLs
        info_urls = []
        keywords = ['form', 'register', 'sign up', 'rsvp', 'link']
        for a in soup.find_all('a', href=True):
            href = a['href']
            text = a.get_text(strip=True).lower()
            full_url = href if href.startswith('http') else 'https://gobblerconnect.vt.edu' + href
            if any(k in text for k in keywords):
                info_urls.append({"label": a.get_text(strip=True), "url": full_url})

        details.append({
            "url": event_url,
            "description": event_text,
            "info_urls": info_urls
        })
    return details

def combined_scraper():

    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')
    driver = webdriver.Chrome(options=options)

    basic_events = scraper_basic_events(driver)
    descriptions = scraper_event_descriptions(driver)
    driver.quit()

    try:
        with open("events.json", "r", encoding="utf-8") as f:
            old_events = json.load(f)
    except FileNotFoundError:
        old_events = []

    combined = []
    for idx, (basic, desc) in enumerate(zip(basic_events, descriptions)):
        new_event = {**basic, **desc}

        # Merge geocoding from old events (if exists) and new event
        old_geocoding = old_events[idx].get("geocoding") or {} if idx < len(old_events) else {}
        new_geocoding = new_event.get("geocoding") or {}
        merged_geocoding = {**old_geocoding, **new_geocoding}
        new_event["geocoding"] = merged_geocoding

        combined.append(new_event)

    with open("events.json", "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=4)

    print(f"Saved {len(combined)} events to events.json")

    geocode_all_events()
    print(f"Geocoding done!")

# Schedule
def run_scheduler():
    combined_scraper()  # run immediately
    schedule.every(60).minutes.do(combined_scraper)
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    run_scheduler()
