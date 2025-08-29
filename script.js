fetch('scores.json')
  .then(res => res.json())
  .then(data => {
    const scores = data.scores.map(entry => {
      // Calculate total score from breakdown
      const breakdown = entry.breakdown;
      let sum = 0;
      let categories = 0;
      for (const key in breakdown) {
        if (key !== 'extra-effort') {
          if (typeof breakdown[key] === 'object') {
            for (const sub in breakdown[key]) {
              sum += Number(breakdown[key][sub]);
            }
            categories++;
          }
        }
      }
      if ('extra-effort' in breakdown) {
        sum += Number(breakdown['extra-effort']);
      }
      return {
        name: entry.name,
        total: categories > 0 ? (sum / categories) : sum,
        breakdown
      };
    });
    // Sort by total descending
    scores.sort((a, b) => b.total - a.total);
    const tbody = document.querySelector('#leaderboard tbody');
    scores.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.total}</td>
        <td><button class="breakdown-btn" data-idx="${idx}">View</button></td>
        <td><button class="project-btn" onclick="window.open('https://selah-summer.netlify.app/projects/${entry.name}', '_blank')">Visit</button></td>
      `;
      tbody.appendChild(tr);
    });
    // Modal logic
    const modal = document.getElementById('breakdown-modal');
    const details = document.getElementById('breakdown-details');
    const closeBtn = document.querySelector('.close');
    tbody.addEventListener('click', function(e) {
      if (e.target.classList.contains('breakdown-btn')) {
        const idx = e.target.getAttribute('data-idx');
        const breakdown = scores[idx].breakdown;
        details.textContent = formatBreakdown(breakdown);
        modal.style.display = 'block';
      }
    });
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    };
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
    function formatBreakdown(breakdown) {
      function formatObj(obj, indent = '') {
        let out = '';
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            out += `${indent}${key}:\n`;
            out += formatObj(obj[key], indent + '  ');
          } else {
            out += `${indent}${key}: ${obj[key]}\n`;
          }
        }
        return out;
      }
      return formatObj(breakdown);
    }
  });
