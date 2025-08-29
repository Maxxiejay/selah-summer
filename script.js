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
  details.innerHTML = formatBreakdown(breakdown);
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
      let html = '';
      for (const key in breakdown) {
        if (typeof breakdown[key] === 'object' && breakdown[key] !== null) {
          html += `<h3 style='margin-top:1em;'>${key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>`;
          html += `<table style='width:100%;margin-bottom:1em;border-collapse:collapse;'>`;
          html += '<tbody>';
          for (const sub in breakdown[key]) {
            html += `<tr><td style='padding:4px 8px;border-bottom:1px solid #eee;'>${sub.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td><td style='padding:4px 8px;border-bottom:1px solid #eee;'>${breakdown[key][sub]}</td></tr>`;
          }
          html += '</tbody></table>';
        } else {
          html += `<h3 style='margin-top:1em;'>${key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>`;
          html += `<div style='margin-bottom:1em;'>${breakdown[key]}</div>`;
        }
      }
      return html;
    }
  });
