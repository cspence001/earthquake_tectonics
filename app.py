from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/", endpoint='index2')
def home():
    return render_template("index2.html")

if __name__ == "__main__":
    app.run(debug=True)
