from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app=Flask(__name__)
CORS(app)

def connect():
    client=MongoClient('mongodb://(name)')
    db=client.sampledb
    return db

@app.route("/insertnote", methods=['POST'])
def insertnote():
    try:
        con=connect()
        note=con.note
        p={}
        p['note']=request.form['note']
        from datetime import datetime
        p["date"]=datetime.now()
        x=note.insert_one(p).inserted_id
        return str(x)
    except Exception as ex:
        return make_response(str(ex),500)

@app.route("/getnotes",methods=['GET'])
def getnotes():
    try:
        con=connect()
        note=con.note
        x=note.find()
        p=[]
        for i in x:
            i["_id"]=str(i["_id"])
            p.append(i)
        return jsonify(p)
    except Exception as ex:
        return make_response(str(ex),500)

if __name__=='__main__':
    app.run(debug=True)
