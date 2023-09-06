import os
import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from random import choice
import tweepy
from config import API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET, UNSPASH_API_KEY
import warnings
warnings.filterwarnings("ignore")


# Maximum tweet length
MAX_LENGTH = 280

def get_hard_coded_quote():
    # List of quotes
    quotes_data = [
        "People will throw stones at you. Don't throw them back. Collect them all and build an empire",
        "Nothing is impossible, the word itself says I'm possible ",
        "I may not be there yet, but I am closer than I was yesterday ",
        "I may not be the best... but I sure am trying my best ",
        "There's about to be a shift in your life. Get ready for your blessings. You've been through enough and a breakthrough is on the way ",
        "Fight for your dreams and your dreams will fight for you ",
        "Don't quit. Suffer now and live the rest of your life as a champion ",
        "no matter your current circumstances if you can imagine something better for yourself you can create it ",
        "Being upset will not solve any problem, but getting UP and SET your way to your goals will ",
        "Being negative only causes depression. So hold your head up high, put a smile on your face & go live a positive life ",
        "Things turn out best for the people who make the best of the way things turn out ",
        "Life is not about winning, it's about not giving up ",
        "Every king was once a crying baby. Every great building was once a blueprint. It's not where you are today but where ",
        "Do not live your life full of WHAT IF's. rather, live your life full of WHY NOT's ",
        "Perseverance is not a long race; it is many short races one after another ",
        "A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty ",
        "Some people want it to happen, some wish it would happen, others make it happen ",
        "When you truly believe in what you are doing, it shows. And it pays. Winners in life are those who are excited about where they are going",
        "Not everything that is faced can be changed, but nothing can be changed until it is faced",
        "It does not matter how many times you get knocked down, but how many times you get up",
        "When there's something you really want, fight for it. Don't give up no matter how hopeless it seems",
        "The sun is a daily reminder that we too can rise again from the darkness, that we too can shine our own light",
        "The difference between who you are and who you want to be is what you do",
        "Success is finding satisfaction in giving a little more than you take ",
        "What defines us is how well we rise after we fall, ",
        "Success is where preparation and opportunity meet ",
        "Every champion was once a contender that didn't give up ",
        "Live your vision and demand your success ",
        "Success is the child of drudgery and perseverance. It cannot be coaxed or bribed; pay the price and it is yours ",
        "To succeed you have to believe in something with such passion that it becomes a reality ",
        "Dream big, it's the first step to success ",
        "Success is sweet and sweeter if long delayed and gotten through many struggles and defeats ",
        "You deserve to be successful and happy, smile :) ",
        "Our greatest glory is not in never falling, but in rising every time we fall ",
        "The five essential entrepreneurial skills for success: Concentration, Discrimination, Organization, Innovation and Communication ",
        "The key to success is to focus our conscious mind on things we desire not things we fear ",
        "Success comes from knowing that you did your best to become the best that you are capable of becoming ",
        "The harder you work for something, the greater you'll feel when you achieve it ",
        "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will ",
        "Man needs his difficulties because they are necessary to enjoy success ",
        "The secret of success is to do the common thing uncommonly well ",
        "Success is how high you bounce when you hit bottom ",
        "Success isn't measured by money or power or social rank. Success is measured by your discipline and inner peace ",
        "Success is not final, failure is not fatal: it is the courage to continue that counts"
    ]

    return choice(quotes_data)

def generate_random_color():
    # Generate a random dark color
    return "#" + "".join(choice("0123456789ABCDEF") for i in range(6))

def fetch_background_image():
    # Unsplash API parameters
    api_key = UNSPASH_API_KEY
    api_url = 'https://api.unsplash.com/photos/random'
    query = 'mountains lake nature'  # Adjust the query as needed

    url = f"{api_url}?query={query}&orientation=landscape"

    try:
        response = requests.get(url, headers={'Authorization': f'Client-ID {api_key}'})
        data = response.json()
        if response.ok:
            return data['urls']['regular'], data['user']['name']
        else:
            print('Failed to fetch image from Unsplash:', data['errors'])
            return None, None
    except Exception as error:
        print('Error occurred while fetching image from Unsplash:', error)
        return None, None

def setup_image(current_tweet, background_image_url):
    # Create an image
    width, height = 1200, 600
    canvas = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(canvas)

    # Set background color or load image
    if background_image_url:
        request = requests.get(background_image_url)
        background = Image.open(BytesIO(request.content))
        background = background.resize((width, height))
        canvas.paste(background, (0, 0))
    else:
        background_color = generate_random_color()
        draw.rectangle([(0, 0), (width, height)], fill=background_color)

    # Get image data
    image_data = canvas.getdata()

    # Calculate average color
    total_r, total_g, total_b = 0, 0, 0
    count = 0
    for r, g, b in image_data:
        total_r += r
        total_g += g
        total_b += b
        count += 1

    avg_r = total_r // count
    avg_g = total_g // count
    avg_b = total_b // count

    brightness = 0.2126 * avg_r + 0.7152 * avg_g + 0.0722 * avg_b

    if True: # brightness < 128:
        tweet_color = '#D5CEA3'
    else:
        tweet_color = '#3C2A21'

    # Draw the text
    words = current_tweet.split(" ")
    font_size = 80
    lines = 1
    font = ImageFont.truetype('arial.ttf', font_size)
    max_text_width = int(width * 0.9)

    while draw.textsize(current_tweet, font=font)[0] > max_text_width:
        if font_size < 48 and lines <= 3:
            current_tweet = "\n".join([
                " ".join(words[i * len(words) // lines:(i + 1) * len(words) // lines])
                for i in range(lines)
            ])
            lines += 1
            font_size += 14
        font_size -= 1
        font = ImageFont.truetype("arial.ttf", font_size)

    text_lines = current_tweet.split("\n")
    max_line_length = max(len(line) for line in text_lines)

    for i in range(len(text_lines)):
        padding = (max_line_length - len(text_lines[i])) // 2
        text_lines[i] = " " * padding + text_lines[i] + " " * padding

    current_tweet = "\n".join(text_lines)

    text_width, text_height = draw.textsize(current_tweet, font=font)
    x = (width - text_width) / 2
    y = (height - text_height) / 2

    draw.text((x, y), current_tweet, font=font, fill=tweet_color, align="center", stroke_width=5, stroke_fill='#3C2A21')

    output_image_path = "./images/output_image.jpg"
    canvas.save(output_image_path)
    # canvas.show()

    return canvas.tobytes()

def post_tweet(body, image):
    print(f"Tweeting:\n{body}\n")

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

    media_id = api.media_upload("./images/output_image.jpg").media_id

    response = client.create_tweet(text=body, media_ids=[media_id])

    return response

def main():
    url = "https://api.quotable.io/random"
    queryParams = {
        'tags': 'inspirational|success|motivational|leadership',
        'maxLength': 220
    }

    print("Fetching Quote")
    quote_data = requests.get(url, params=queryParams)
    if quote_data.status_code == 200:
        quote = quote_data.json()['content']
        print("Quote Fetched Successfully")
    else:
        print("Couldn't Fetch Quote")
        quote = get_hard_coded_quote()

    print("Fetching Background Image")
    background_image_url, photographer = fetch_background_image()
    if not background_image_url:
        print("Couldn't Fetch Background Image")
        background_image_url = None

    tweet_body = f"""{quote}

Photo by {photographer} on Unsplash
#MotivationalQuotes"""

    tweet_image = setup_image(quote, background_image_url)
    response = post_tweet(tweet_body, tweet_image)

    print(f"Response to tweet: {response}")

if __name__ == "__main__":
    main()
