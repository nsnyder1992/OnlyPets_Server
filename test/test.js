const fetch = require("node-fetch");
const baseUrl = "http://localhost:3001";
const FormData = require("form-data");

//cloudinary
const signatureUrl = "http://localhost:3001/post/cloudinary";
const cloudinaryUrl =
  "https://api.cloudinary.com/v1_1/nsnyder1992/image/upload";

//setup types and ids for later use
const types = ["dog"]; //"cat", "fox"];
let petId;
let petType;

const setupDB = async () => {
  let indexer = 0;
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();

  /////////////////////////////////////////////
  //CREATE USERS
  /////////////////////////////////////////////
  for (let i = 0; i <= 10; i++) {
    let username = `nick${i}@test.com`;
    let password = "password";
    let token;

    await fetch(`${baseUrl}/user/create`, {
      method: "POST",
      body: JSON.stringify({
        user: { username: username, password: password },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        token = json.sessionToken;
        console.log(json);
      })
      .catch((err) => {
        return console.log(err);
      });

    let names = [
      "Fluffy",
      "Bruce",
      "John",
      "Snoopy",
      "Poka",
      "JJ",
      "Nola",
      "Omega",
      "JoJo",
      "Beans",
    ];

    /////////////////////////////////////////////
    //CREATE PETS
    /////////////////////////////////////////////
    for (let j of types) {
      //get name
      indexer = indexer >= 9 ? 0 : indexer + 1;
      let name = names[indexer];

      await fetch(`${baseUrl}/pet/create`, {
        method: "POST",
        body: JSON.stringify({
          pet: {
            name: name,
            type: j,
            description: `this is a ${j}`,
            moneyToSubscribe: 0,
          },
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          petId = json.id;
          petType = json.type;
          console.log(json);
        })
        .catch((err) => {
          return console.log(err);
        });

      /////////////////////////////////////////////
      //CREATE POSTS
      /////////////////////////////////////////////
      for (let z = 0; z < 3; z++) {
        const res = await fetch("https://dog.ceo/api/breeds/image/random");
        const json = await res.json();
        const img = json.message;

        const cloudinaryJson = await uploadImg(
          signatureUrl,
          cloudinaryUrl,
          img,
          token
        );

        const description =
          posts[Math.floor(Math.random() * posts.length)].body;

        await fetch("http://localhost:3001/post/", {
          method: "Post",
          body: JSON.stringify({
            photoUrl: img,
            description: description,
            petId: petId,
            petType: petType,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        })
          .then((res) => res.json())
          .then((json) => console.log(json))
          .catch((err) => {
            return console.log(err);
          });
      }
    }
  }
  console.log("done");
};

setupDB();

const uploadImg = async (signatureUrl, cloudinaryUrl, file, sessionToken) => {
  let formData = new FormData();
  let filename = "test";
  if (!filename) return;
  //get cloudinary security from backend
  const res = await fetch(`${signatureUrl}/${filename}`, {
    method: "GET",
    headers: {
      authorization: sessionToken,
    },
  });
  const json = await res.json();

  //set form data
  formData.append("file", file);
  formData.append("api_key", json.key);
  formData.append("timestamp", json.timestamp);
  formData.append("folder", json.folder);
  formData.append("public_id", json.public_id);
  formData.append("signature", json.signature);

  //post to cloudinary and get url for storage
  const cloudinaryRes = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });
  const cloudinaryJson = await cloudinaryRes.json();
  return cloudinaryJson;
};
