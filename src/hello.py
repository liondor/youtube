import httplib2
import sys
import math
import unittest
import json
import mysql.connector
import os
import setEnv
from GoogleNews import GoogleNews
from oauth2client.file import Storage
from oauth2client.client import flow_from_clientsecrets
from oauth2client.tools import argparser, run_flow
from apiclient.discovery import build




def testApiChannels(self):
    youtubeAuthorization = getAuthorization()
    channels=getChannelResources(youtubeAuthorization)
    self.assertEqual(channels["kind"], "youtube#channelListResponse")

def get_news():
    googleNews = GoogleNews()
    googleNews.set_period('3d')
    googleNews.get_news('Chainsawman')
    news=googleNews.get_texts()
    if(len(news)<3):
        limit=len(news)
    else :
        limit=3
    for i in range(0,limit)  :
        print(news[i]+"\n")

    googleNews.clear()
    googleNews.set_period('3d')
    googleNews.get_news('Jojo bizarre adventure part 6')

    news=googleNews.get_texts()
    if(len(news)<3):
        limit=len(news)
    else :
        limit=3
    for i in range(0,limit)  :
        print(news[i]+"\n")

def getAuthorization():
    #storage va contenir le fichier ayant les tokens donné par Oauth, ou créera un fichier s'il n'existe pas
    storage = Storage("{}-oauth2.json".format(sys.argv[0]))
    #Avec get, on récupère les informations du token
    credentials = storage.get()
    #Ce sont des objets et fonctions venant du paquet Oauth2client, tout est donc déjà fait.
    #On vérifie si un token existe et est valide
    if credentials is None or credentials.invalid:
        #Si il n'y en a pas, ou qu'il est invalide, on prépare un "flux Oauth"
        flow = flow_from_clientsecrets("client_secrets.json", scope="https://www.googleapis.com/auth/youtube", message="Secret file missing")
        #Grâce à argparser, on créer facilment les paramètres pour la fenêtre auth (port utilisé pour la réception, nom de mon PC, etc...)
        args=argparser.parse_args()
        #run_flow ouvre la fenêtre en utilisant les paramètre qu'on lui a donné. Si tout ce passe bien, il mettra le token dans le fichier contenu dans storage
        credentials = run_flow(flow,storage,args)
    return build("youtube","v3",http=credentials.authorize(httplib2.Http()))

def getSubscriptions(youtubeAuthorization,nextPageToken):
    subscritionsResponse = youtubeAuthorization.subscriptions().list(
    part='snippet',
    mine=True,
    maxResults=50,
    order='alphabetical',
    pageToken=nextPageToken
    ).execute()
    return subscritionsResponse

def getChannels(youtubeAuthorization):
    #Récupération des abonnements
    #Pour pouvoir récupérer les abonnements d'un utilisateur, il faut que l'utilisateur se connecte et autorise à ce programme l'accès au compte
    pageToken=""
    subscriptions = getSubscriptions(youtubeAuthorization,pageToken)

    totalSubscriptions=subscriptions["pageInfo"]["totalResults"]
    subscriptionsPerRequest=subscriptions["pageInfo"]["resultsPerPage"]

#    print(str(math.ceil(totalSubscriptions/subscriptionsPerRequest)))
    iterationNeeded=math.ceil(totalSubscriptions/subscriptionsPerRequest)
    allChannels=[]
    allChannels+=subscriptions['items']
    for i in range(0,iterationNeeded-1):
            pageToken = subscriptions["nextPageToken"]
            subscriptions = getSubscriptions(youtubeAuthorization,pageToken)
            allChannels+=subscriptions['items']
    return allChannels

def getChannelResources(youtubeAuthorization, allChannelsIds):
    channelResources=youtubeAuthorization.channels().list(
    part="contentDetails",
    id=allChannelsIds
    ).execute()
    
    return channelResources

def updateChangesDB(cursor, author, iframe):
    cursor.execute("UPDATE videosInfo SET author ='"+author+"' WHERE iframe = '"+iframe+"'")

def getChannelsDetails(youtubeAuthorization,allChannels):
    totalQueries=0
    allChannelsIds=""
    detailsOfChannels=[]
    for i in range(0, len(allChannels)):
        allChannelsIds+=allChannels[i]['snippet']['resourceId']['channelId']+", "    
        if(i%50==0):
            #print(i, allChannelsIds)
            detailsOfChannels+=getChannelResources(youtubeAuthorization, allChannelsIds[:-2])["items"]
            allChannelsIds=""
            totalQueries+=1
            
    if(len(allChannels)>len(detailsOfChannels)):
        detailsOfChannels+=getChannelResources(youtubeAuthorization, allChannelsIds)["items"]
    return detailsOfChannels

def getUploadList(channelsDetails):
    allUploadsLinks=[]
    for i in range(0, len(channelsDetails)):
        allUploadsLinks.append(channelsDetails[i]["contentDetails"]["relatedPlaylists"]['uploads'])
    return allUploadsLinks
def getLatestUploads(youtubeAuthorization,uploadPlaylists):
    response=[]
    for i in range(0, len(uploadPlaylists)):
        try:
            response+=youtubeAuthorization.playlistItems().list(
                part="contentDetails",
                maxResults=2,
                playlistId=uploadPlaylists[i]
            ).execute()['items']
        except:
            print("Unexpected error with playlist : "+uploadPlaylists[i])
    return response

#print("Do you wish to get an update on the anime you're waiting for ? \n Type Yes or y to acccept. \n")
#answer = "y" # input()
#if(answer=='y'or answer=='Yes'):
  #  get_news()

#initialisation
youtubeAuthorization=getAuthorization()
#On récupère la liste des chaines auxquels l'utilisateur est abonné
allChannels=getChannels(youtubeAuthorization)
#print(allChannels)
channelsDetails=[]
#A partir de cette liste, on demande des informations détaillées sur chaque chaines.
channelsDetails=getChannelsDetails(youtubeAuthorization,allChannels)
#On retire 1 char parce qu'il y aura une virgule à la fin. C'est efficace que de vérifier à chaque fois si on est à la fin.
#allChannelsIds=allChannelsIds[:-2]
#print(allChannelsIds)

#print(channelsDetails)
youtubeGamingId="UCOpNcN46UbXVtpKMrmU4Abg"
youtubeMusicId="UC-9-kyTW8ZkZNDHQJ6FgpwQ"
youtubePopularId="UCmzy72gDEpfXoFV9Xdtd0DQ"
unwantedChannelsIds=[youtubeGamingId, youtubeMusicId, youtubePopularId]
#for i in range(0, len(allChannelsIds)):
#Create a list of the playlists containing every single video uploaded by a channel
filteredChannels= [channel for channel in channelsDetails if channel["id"] not in unwantedChannelsIds]
playlists=getUploadList(filteredChannels)
#print(playlists)
#print(playlists)
#Get the lastest video from each playlist that has been published in the last 3 days ?
latestUploads =getLatestUploads(youtubeAuthorization, playlists)
#print(latestUploads)
lastestUploadsContentDetails=[]
videosURLCompilation=""
counter = 1
videos=[]
for video in latestUploads:
    lastestUploadsContentDetails.append(video['contentDetails'])
    videosURLCompilation+=video['contentDetails']['videoId']+","
    counter+=1
    if(counter%50==0 or len(latestUploads)/counter==1):
        
        videosURLCompilation=videosURLCompilation[:-1]
        videosInfoRequest=youtubeAuthorization.videos().list(
        part="snippet,player",
        id=videosURLCompilation
        )
        videos+=videosInfoRequest.execute()['items']
        videosURLCompilation=""

setEnv.setEnvironment()
mydb= mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    charset="utf8mb4",
    database=os.getenv('DB_NAME')
)

mycursor = mydb.cursor()
#print(videos[0]['snippet']['channelTitle'])
#mycursor.execute("CREATE DATABASE hedonism")
#mycursor.execute("CREATE TABLE videosInfo (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), iframe TEXT, publishedAt DATETIME)")
#mycursor.execute("SET NAMES utf8mb4; ALTER DATABASE hedonism CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci;",multi=True)
#mycursor.execute("SHOW VARIABLES WHERE Variable_name LIKE 'character\_set\_%' OR Variable_name LIKE 'collation%';")
#for x in mycursor:
   # print(x)
videoData = []
for video in videos:
    dataExtracted = {"title":video["snippet"]["title"],"author":video['snippet']['channelTitle'], "iframe":video["player"]["embedHtml"],"publishedAt":video["snippet"]["publishedAt"]}
    videoData.append(dataExtracted)
#print(videoData)

try:
    for videoInfo in videoData:
       # print(videoInfo)
        #mycursor.execute("INSERT IGNORE INTO videosInfo(title, iframe, publishedAt) VALUES('"+video["snippet"]["title"].replace("'","")+"','"+ video["player"]["embedHtml"]+"','"+video["snippet"]["publishedAt"].replace('T',' ').replace('Z','')+"')")
        #print("INSERT INTO videosInfo(title, iframe, publishedAt) SELECT '"+video["snippet"]["title"].replace("'","")+"' AND '"+ video["player"]["embedHtml"]+"' AND '"+video["snippet"]["publishedAt"].replace('T',' ').replace('Z','')+"' FROM DUAL WHERE NOT EXISTS (SELECT * FROM videosInfo WHERE title='"+video["snippet"]["title"].replace("'","")+"' AND iframe='"+ video["player"]["embedHtml"]+"' AND publishedAt='"+video["snippet"]["publishedAt"].replace('T',' ').replace('Z','')+"' LIMIT 1)")
        #mycursor.execute("INSERT INTO videosInfo(title, iframe, publishedAt) SELECT 'title="+video["snippet"]["title"].replace("'","")+"' AND '"+ video["player"]["embedHtml"]+"' AND '"+video["snippet"]["publishedAt"].replace('T',' ').replace('Z','')+"' FROM DUAL WHERE NOT EXISTS (SELECT * FROM videosInfo WHERE title='"+video["snippet"]["title"].replace("'","")+"' AND iframe='"+ video["player"]["embedHtml"]+"' AND publishedAt='"+video["snippet"]["publishedAt"].replace('T',' ').replace('Z','')+"' LIMIT 1")
        mycursor.execute("INSERT INTO videosInfo(title, author, iframe, publishedAt)  SELECT '"+videoInfo["title"].replace("'","")+"','"+videoInfo['author'].replace("'","")+"', '"+videoInfo["iframe"]+"','"+videoInfo["publishedAt"].replace('T',' ').replace('Z','')+"' FROM DUAL WHERE NOT EXISTS (SELECT * FROM videosInfo WHERE iframe='"+videoInfo["iframe"]+"' AND publishedAt='"+videoInfo["publishedAt"].replace('T',' ').replace('Z','') +"' LIMIT 1)")
       # updateChangesDB(mycursor,videoInfo['author'].replace("'",""),videoInfo["iframe"] )
        #title='"+video["snippet"]["title"].replace("'","")+"' AND
        #for x in mycursor:
         #  print(x)
except mysql.connector.Error as err:
    print("Something went wrong: {}".format(err))
#mycursor.execute("SHOW TABLES")



#
 #   print(latestVids["items"][0]["id"]['videoId'], latestVids["items"][0]['snippet']['channelTitle'])
   # print(len(latestVidsSearch))

    #print(latestVids["items"][i]["id"]['videoId'], latestVids["items"][i]['snippet']['channelTitle'])
"""