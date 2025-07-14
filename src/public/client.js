let store = {
    user: { name: "NASA Fans" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod, selectedRoverData } = state;
    const roverButtons = rovers.map(name =>
        `<button onclick="handleRoverClick('${name}')">${name}</button>`
    ).join(" ");

    return `
        <header>
            <h1>Welcome, ${state.user.name}</h1>
            ${roverButtons}
        </header>
        <main>
            ${selectedRoverData ? RoverView(selectedRoverData) : '<p>Choose a Rover</p>'}
        </main>
    `;
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const RoverView = (roverData) => {
    if (!roverData) return "<p style='color:red;'>Load failed or no data available.</p>";

    const { photos, rover } = roverData;

    if (!Array.isArray(photos) || photos.length === 0 || !rover) {
        return `<p style='color:red;'>${roverData.error}</p>`;
    }

    const roverInfo = `
        <div>
            <h2>${rover.name}</h2>
            <p><strong>Launch Date:</strong> ${rover.launch_date}</p>
            <p><strong>Landing Date:</strong> ${rover.landing_date}</p>
            <p><strong>Status:</strong> ${rover.status}</p>
        </div>
    `;

    const gallery = photos.map(img =>
        `<img src="${img.img_src}" alt="Mars rover photo" width="300">`
    ).join("");

    return `<section>${roverInfo}<div class="gallery">${gallery}</div></section>`;
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return data
}

const getRoverData = async (roverName) => {
    try {
        const res = await fetch(`/rover/${roverName}`);

        if (!res.ok) {
            const errorData = await res.json();
            return { error: errorData.error || 'Unknown error occurred' };
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch rover data:", error);
        return { error: "Network or server error occurred." };
    }
};


window.handleRoverClick = async (roverName) => {
    const roverData = await getRoverData(roverName);
    updateStore(store, { selectedRoverData: roverData });
}