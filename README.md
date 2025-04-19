<h1 align="center">🧠 AutiSense 🧠</h1>

<p align="center">
  A responsive, child‑friendly web application that connects autistic children (6–14), their parents, and specialized teachers through interactive lessons, games, AI‑driven insights, and a Supabase backend — built entirely with HTML, CSS &amp; JavaScript.
</p>

<hr>

<h2>📝 Overview</h2>
<p>This project delivers:</p>
<ol>
  <li><b>Interactive Learning for Children:</b> Short animated lessons (hygiene, safety, social skills) plus mini‑tests and educational games.</li>
  <li><b>Parent Dashboard &amp; AI Insights:</b> Track each child’s progress, view charts &amp; test stats, receive personalized AI analysis &amp; recommendations.</li>
  <li><b>Teacher Directory &amp; Profiles:</b> Specialized educators register, showcase experience/skills, and parents can filter &amp; connect.</li>
</ol>

<hr>

<h2>✨ Key Features</h2>
<ul>
  <li>🎮 <b>Lessons &amp; Games:</b> Colorful card grid, embedded GIF/video animations, MCQ quizzes, drag‑and‑drop &amp; matching games.</li>
  <li>👪 <b>Parent Panel:</b> Login/Register via Supabase Auth, add/manage children, switch active child, progress bars &amp; Chart.js graphs.</li>
  <li>🤖 <b>AI Assistant:</b> On first visit, fetch child profile &amp; stats from Supabase, send a custom “initial analysis” prompt to Gemini API, then answer follow‑up parent questions using stored data.</li>
  <li>🧑‍🏫 <b>Teacher Module:</b> Registration form, profile cards, filter by region/skill/experience, modal detail view.</li>
  <li>🌐 <b>Full Frontend Stack:</b> HTML5, CSS3, Vanilla JavaScript, Supabase JS SDK (no custom backend server).</li>
  <li>📱 <b>Responsive Design:</b> Desktop &amp; tablet optimizations, burger‑menu header, soft pastel color palette, rounded cards &amp; playful icons.</li>
</ul>

<hr>

<h2>🛠️ Technologies &amp; Architecture</h2>
<ul>
  <li><b>Markup &amp; Styles:</b> HTML5, CSS3 (Flexbox, Grid, Media Queries)</li>
  <li><b>Client‑side Logic:</b> Vanilla JavaScript (ES6+), Chart.js for graphs</li>
  <li><b>Database &amp; Auth:</b> Supabase (PostgreSQL, REST &amp; JS SDK, Auth)</li>
  <li><b>AI &amp; LLM:</b> Google Gemini API for generative insights &amp; chat</li>
  <li><b>Static Assets:</b> Lottie/GIF animations, DiceBear avatars</li>
</ul>

<hr>

<h2>📋 Prerequisites</h2>
<ul>
  <li>Modern web browser (Chrome, Firefox, Edge)</li>
  <li>Supabase project with tables:
    <ul>
      <li><code>users</code> (id, email, role)</li>
      <li><code>children</code> (id, name, age, parent_id)</li>
      <li><code>tests, game_results, ai_feedback</code></li>
      <li><code>teachers</code> (profile fields)</li>
    </ul>
  </li>
  <li>Google Cloud API key for Gemini Model access</li>
</ul>

<hr>

<h2>🚀 Getting Started</h2>
<ol>
  <li><b>Clone the repository:</b>
    <pre><code>git clone &lt;https://github.com/UserAAR/eduhack-autisense.git&gt; && cd autism-learning-platform</code></pre>
  </li>
  <li><b>Configure environment:</b>
    <pre><code>
-- In <code>main.js</code>:
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';</code></pre>
  </li>
  <li><b>Open <code>index.html</code> in your browser:</b>
    <p>No build step required — everything runs client‑side.</p>
  </li>
  <li><b>Register as Parent/Teacher:</b> Use Supabase Auth UI, then explore dashboards.</li>
</ol>


<hr>


<h2>📬 Contact</h2>
<p align="center">
  Developed with ❤️ by <b> DeepSense Team</b><br>
  <a href="mailto:deepsense.az@gmail.com">deepsense.az@gmail.com</a>
</p>
