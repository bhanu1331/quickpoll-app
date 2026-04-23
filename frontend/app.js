console.log("JS Loaded");

// Add option input
function addOption() {
  const count = document.querySelectorAll(".opt").length;

  if (count >= 4) {
    alert("Maximum 4 options allowed");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "option-row";

  wrapper.innerHTML = `
    <input class="opt" placeholder="Enter option">
    <button onclick="this.parentElement.remove()">✖</button>
  `;

  document.getElementById("options").appendChild(wrapper);
}

// Create poll
async function createPoll() {
  const question = document.getElementById("question").value.trim();

  const options = [...document.querySelectorAll(".opt")]
    .map(input => input.value.trim());

  if (!question) return alert("Enter question");
  if (options.length < 2 || options.length > 4)
    return alert("Provide 2-4 options");
  if (options.some(o => o === ""))
    return alert("Options cannot be empty");

  await fetch("http://localhost:5000/polls", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ question, options })
  });

  document.getElementById("question").value = "";
  document.getElementById("options").innerHTML = "";

  fetchPolls();
}

// Fetch polls
async function fetchPolls() {
  const res = await fetch("http://localhost:5000/polls");
  const polls = await res.json();

  const container = document.getElementById("polls");
  container.innerHTML = "";

  polls.forEach(poll => {
    const total = poll.options.reduce((s, o) => s + o.votes, 0);
    const maxVotes = Math.max(...poll.options.map(o => o.votes));

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
  <h3>${poll.question}</h3>

  <p>Total Votes: ${total}</p>

  <p>Winner: ${
    maxVotes === 0
      ? "No votes yet"
      : poll.options.find(o => o.votes === maxVotes).text
  }</p>

  <p>Created: ${
  poll.createdAt && !isNaN(new Date(poll.createdAt))
    ? new Date(poll.createdAt).toLocaleString()
    : "Just now"
}</p>

  ${poll.options.map((opt, index) => {
    const percent = total === 0 ? 0 : Math.round((opt.votes / total) * 100);
    const isWinner = opt.votes === maxVotes && maxVotes > 0;

    return `
      <button onclick="vote(${poll.id}, ${index})">
        ${opt.text}
      </button>

      <div class="bar-container">
        <div class="bar ${isWinner ? 'winner' : ''}" style="width:${percent}%">
          ${percent}% (${opt.votes})
        </div>
      </div>
    `;
  }).join("")}

  <button onclick="deletePoll(${poll.id})" class="delete-btn">
    Delete Poll
  </button>
`;

    container.appendChild(card);
  });
}

// Vote
async function vote(id, index) {
  if (localStorage.getItem("voted_" + id)) {
    alert("Already voted!");
    return;
  }

  await fetch(`http://localhost:5000/polls/${id}/vote`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ optionIndex: index })
  });

  localStorage.setItem("voted_" + id, true);
  fetchPolls();
}

// Delete poll
async function deletePoll(id) {
  await fetch(`http://localhost:5000/polls/${id}`, {
    method: "DELETE"
  });

  fetchPolls();
}

// Load
fetchPolls();