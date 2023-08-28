import tweepy
from config import API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET, BEARER_TOKEN, CLIENT_ID, CLIENT_SECRET
import random


# Authenticate with the Twitter API
client = tweepy.Client(
    consumer_key=API_KEY,
    consumer_secret=API_SECRET,
    access_token=ACCESS_TOKEN,
    access_token_secret=ACCESS_TOKEN_SECRET,
)
auth = tweepy.OAuth1UserHandler(
    consumer_key=API_KEY,
    consumer_secret=API_SECRET,
    access_token=ACCESS_TOKEN,
    access_token_secret=ACCESS_TOKEN_SECRET,
)
api = tweepy.API(auth)

# List of motivational quotes
quotes = [
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    # Add more quotes here
]

# Choose a random quote
selected_quote = random.choice(quotes)

# upload image to twitter
media_id = api.media_upload("./images/img.jpg")
print(f"Response to media upload: {media_id.media_id}")

# Post the quote as a tweet
response = client.create_tweet(text=selected_quote, media_ids=[media_id.media_id])

# Print the response
print(f"Response to tweet: {response}")

print(api.verify_credentials().screen_name)
