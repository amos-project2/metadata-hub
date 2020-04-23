Build:
docker build --rm -t exiftool .
Run:
docker run -ti --rm --name exiftool exiftool
Example Output for exiftool (in container):
exiftool tmp/bird.jpg
