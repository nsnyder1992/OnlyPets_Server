const fetch = require("node-fetch");
const baseUrl = "https://serene-garden-06415.herokuapp.com";
const FormData = require("form-data");

//cloudinary
const signatureUrl = baseUrl + "/post/cloudinary";
const cloudinaryUrl =
  "https://api.cloudinary.com/v1_1/nsnyder1992/image/upload";

//setup types and ids for later use
const types = ["dog", "cat"]; //"cat", "fox"];

const createUsersPets = async () => {
  let indexer = 0;
  let petId;
  let petType;

  /////////////////////////////////////////////
  //CREATE USERS
  /////////////////////////////////////////////
  for (let i = 0; i <= 10; i++) {
    let username = `test1${i}@test.com`;
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

    /////////////////////////////////////////////
    //CREATE PETS
    /////////////////////////////////////////////
    for (let j of types) {
      //get name
      indexer = indexer >= 9 ? 0 : indexer + 1;
      //   let name = names[indexer];
      let name;
      await fetch("https://uzby.com/api.php?min=3&max=8")
        .then((res) => res.text())
        .then((text) => (name = text))
        .catch((err) => console.log(err));

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
    }
  }
};

/////////////////////////////////////////////
//CREATE POST
/////////////////////////////////////////////
const createPosts = async () => {
  //sign in
  let token;
  await fetch(baseUrl + "/user/login", {
    method: "POST",
    body: JSON.stringify({
      user: { username: "nick0@test.com", password: "password" },
    }),
    headers: {
      "content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log("sigin", json.sessionToken);
      token = json.sessionToken;
    })
    .catch((err) => console.log(err));

  // get pets
  let pets;
  await fetch(baseUrl + "/pet/", {
    method: "GET",
    headers: {
      authorization: token,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      pets = json.pets;
    })
    .catch((err) => console.log(err));

  //get post descriptions from external api
  const resDesc = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await resDesc.json();
  console.log(pets);
  for (let i = 0; i < 70; i++) {
    let pet = pets[Math.floor(Math.random() * pets.length)];
    console.log(pet);
    let petId = pet.id;
    let ownerId = pet.userId;
    let petType = pet.type;

    //signIn as ownerId
    resUser = await fetch(`${baseUrl}/user/byId/${ownerId}`, {
      method: "GET",
      headers: {
        authorization: token,
      },
    });
    user = await resUser.json();

    console.log(user);

    await fetch(baseUrl + "/user/login", {
      method: "POST",
      body: JSON.stringify({
        user: { username: user.username, password: "password" },
      }),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("sigin", json.sessionToken);
        token = json.sessionToken;
      })
      .catch((err) => console.log(err));

    let res;
    let img;
    if (petType == "dog") {
      res = await fetch("https://dog.ceo/api/breeds/image/random");
      const json = await res.json();
      img = json.message;
    }
    if (petType == "cat") {
      res = await fetch("https://api.thecatapi.com/v1/images/search");
      const json = await res.json();
      console.log(json);
      img = json[0].url;
    }

    const cloudinaryJson = await uploadImg(
      signatureUrl,
      cloudinaryUrl,
      img,
      token
    );

    const description = posts[Math.floor(Math.random() * posts.length)].body;

    await fetch(baseUrl + "/post/", {
      method: "POST",
      body: JSON.stringify({
        photoUrl: cloudinaryJson.url,
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
};

const setupDB = async () => {
  await createUsersPets();
  await createPosts();
  console.log("DONE!!!");
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
