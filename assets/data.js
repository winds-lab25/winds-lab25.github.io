/* Built-in copy of the site content.
   - Shown when no Google Script URL is set in assets/config.js, or if the script can't be reached.
   - Used once by the admin page ("Copy built-in content into the Google Sheet") to fill a new Sheet.
   You can replace this file with the "Download backup" file from the admin page at any time. */
window.SITE_DATA = {
  "news": [
    { "date": "Oct 2026", "tag": "Paper", "text": "Three conference papers accepted in **ICDCN 2027**." },
    { "date": "Jun 2026", "tag": "Paper", "text": "Conference paper accepted in **IEEE TENCON 2026**." },
    { "date": "Jun 2026", "tag": "Milestone", "text": "The lab’s **first patent is granted**." },
    { "date": "Jun 2026", "tag": "Paper", "text": "Two conference papers accepted in **IEEE VTC 2026**." },
    { "date": "Apr 2026", "tag": "Paper", "text": "Paper accepted at **IFIP Networking 2026** — CoGen-AI-FNC Workshop." },
    { "date": "Mar 2026", "tag": "Award", "text": "Rakesh Pradhan (doctoral student) receives the **IndiaAI PhD Fellowship** from MeitY." },
    { "date": "Jan 2026", "tag": "Paper", "text": "Conference paper accepted at **IEEE WCNC 2026**." },
    { "date": "Dec 2025", "tag": "Paper", "text": "Article accepted in **IEEE Engineering Management Review**." },
    { "date": "Oct 2025", "tag": "Grant", "text": "Received a research grant from **TiHAN, IIT Hyderabad**." },
    { "date": "Mar 2025", "tag": "Paper", "text": "Article accepted in **IEEE Communications Surveys & Tutorials**." },
    { "date": "Feb 2025", "tag": "Grant", "text": "Awarded ANRF’s **Prime Minister Early Career Research Grant**." },
    { "date": "Feb 2025", "tag": "Paper", "text": "Conference paper accepted in **IEEE NCC 2025**." },
    { "date": "Nov 2024", "tag": "Paper", "text": "Article accepted in **IEEE Internet Computing**." },
    { "date": "Aug 2024", "tag": "Lab", "text": "Dr. Kalita **joins IIT (ISM) Dhanbad** and founds the WiNDS Lab." }
  ],

  "research": [
    { "title": "Internet of Things", "description": "Making dense, low-power IoT deployments reliable and scalable — reliability, scheduling, and lifetime under real constraints.", "keywords": "RPL, 6TiSCH, DSME, 802.15.4e" },
    { "title": "Wireless Networks", "description": "Squeezing more range, throughput, and mission-critical reliability out of the wireless edge, including UAV networks.", "keywords": "802.11ah, UAV, LPWAN" },
    { "title": "Protocol Performance", "description": "Rigorous, reproducible evaluation of IoT protocols — building simulators and testbeds to see what really happens.", "keywords": "Simulators, Testbeds, Benchmarking" },
    { "title": "Congestion Control", "description": "Keeping the next-generation Internet stable under load with smarter flow, queue, and buffer management.", "keywords": "Next-gen Internet, Queueing" },
    { "title": "Edge Computing", "description": "Moving intelligence to the edge, where latency, energy, and privacy budgets are tight.", "keywords": "Fog/Edge, Industry 5.0" },
    { "title": "Deep RL for Networks", "description": "Applying deep reinforcement learning to scheduling, routing, and control in computer networks.", "keywords": "Deep RL, AI for systems" }
  ],

  "devices": [
    { "name": "IoT sensor nodes", "category": "IoT node", "description": "Low-power wireless nodes that make up the lab’s IoT testbed for protocol experiments.", "image": "", "specs": "IEEE 802.15.4, 6TiSCH, RPL" },
    { "name": "Gateway / border router", "category": "Gateway", "description": "Connects the low-power testbed to the lab network and edge servers.", "image": "", "specs": "" },
    { "name": "Mobile robots", "category": "Robot", "description": "Robots that act as moving nodes in wireless networking experiments.", "image": "", "specs": "" },
    { "name": "UAV platform", "category": "UAV", "description": "Drones for experiments on UAV-based IoT networks.", "image": "", "specs": "IEEE 802.11ah" }
  ],

  "people": [
    { "name": "Rakesh Pradhan", "group": "PhD", "topic": "AI/ML for Computer Systems", "period": "Since Apr 2025", "note": "IndiaAI PhD Fellowship", "photo": "assets/img/students/rakesh.jpg", "link": "" },
    { "name": "Ashish Singh", "group": "PhD", "topic": "Improving the performance of DSME networks", "period": "Since Jul 2025", "note": "", "photo": "assets/img/students/ashish.jpg", "link": "" },
    { "name": "Saket Tudu", "group": "PhD", "topic": "Improving the RPL routing protocol for LLNs", "period": "Since Feb 2026", "note": "", "photo": "assets/img/students/saket.jpg", "link": "" },
    { "name": "Anindita Sarkar", "group": "PhD", "topic": "Adaptive cell scheduling in 6TiSCH networks", "period": "Since Feb 2026", "note": "", "photo": "assets/img/students/anindita.jpg", "link": "" },
    { "name": "Aman Shaw", "group": "Master's", "topic": "M.Tech · Ongoing", "period": "2024–2026", "note": "", "photo": "assets/img/students/aman.jpg", "link": "" },
    { "name": "Punam Khilari", "group": "Master's", "topic": "M.Tech · Ongoing", "period": "2024–2026", "note": "", "photo": "assets/img/students/punam.jpg", "link": "" }
  ],

  "publications": [
    { "category": "Patent", "authors": "A. Kalita", "title": "An IoT-enabled System and Process for Real-time Monitoring of an Infant to Prevent Falling Off a Surface above Ground Level", "venue": "Indian Patent", "details": "Granted 24/06/2026 · Ref. 202431081152", "link": "" },
    { "category": "Patent", "authors": "A. Kalita", "title": "A System and Method for Improving the Performance of IEEE 802.15.4 and IEEE 802.15.4e Standardized Internet of Things Networks", "venue": "Indian Patent", "details": "Filed 28/03/2025 · Ref. 202531029706", "link": "" },

    { "category": "Journal", "authors": "A. Kalita", "title": "Autonomous Energy-Aware Cell Scheduling for 6TiSCH-based Industrial IoT", "venue": "IEEE Internet of Things Journal", "details": "2026 · Accepted", "link": "" },
    { "category": "Journal", "authors": "P. Maurya, A. Hazra, and A. Kalita", "title": "Unleashing the Potential of Industrial IoT and Industry 5.0", "venue": "IEEE Engineering Management Review", "details": "2025 · Accepted", "link": "https://ieeexplore.ieee.org/document/11300931" },
    { "category": "Journal", "authors": "P. Joshi, A. Kalita, and M. Gurusamy", "title": "Reliable and Efficient Data Collection in UAV-based IoT Networks", "venue": "IEEE Communications Surveys & Tutorials", "details": "IF 46.7 · vol. 28, pp. 2531–2571 · 2025", "link": "https://ieeexplore.ieee.org/abstract/document/10922390" },
    { "category": "Journal", "authors": "A. Hazra, A. Kalita, M. Gurusamy, and D. Sah", "title": "Potential of Zero-Touch Network Management in Industry 5.0: A Future Prospect", "venue": "IEEE Internet Computing", "details": "IF 3.7 · vol. 28, no. 6, pp. 45–52 · 2024", "link": "https://ieeexplore.ieee.org/abstract/document/10766850" },
    { "category": "Journal", "authors": "A. Hazra, P. Maurya, A. Kalita, S. Deb, M. Gurusamy, and V. G. Menon", "title": "Cognitive Computing and Machine Intelligence in Fog-Cloud Infrastructure for Industry 5.0", "venue": "IEEE Consumer Electronics Magazine", "details": "IF 4.5 · 2024", "link": "https://ieeexplore.ieee.org/document/10538400" },
    { "category": "Journal", "authors": "A. Kalita and M. Gurusamy", "title": "On-the-Fly Autonomous Slot Allocation in 6TiSCH-based Industrial IoT Networks", "venue": "IEEE Transactions on Industrial Informatics", "details": "IF 12.3 · vol. 20, no. 7, pp. 9365–9374 · 2024", "link": "https://ieeexplore.ieee.org/document/10504655" },

    { "category": "Conference", "authors": "S. Tudu, A. Sarkar, and A. Kalita", "title": "A Non-cooperative Gaming Approach for Congestion Control in 6TiSCH IoT Networks", "venue": "28th International Conference on Distributed Computing and Networking (ICDCN 2027)", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "A. Sarkar, S. Tudu, and A. Kalita", "title": "FLASH: Flexible Load-Adaptive Autonomous Cell Scheduling for 6TiSCH IoT Networks", "venue": "28th International Conference on Distributed Computing and Networking (ICDCN 2027)", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "AFA, A. Kalita, and T. Ojha", "title": "Autonomous Traffic-Adaptive RAW Scheduling for IEEE 802.11ah IoT Networks", "venue": "28th International Conference on Distributed Computing and Networking (ICDCN 2027)", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "AFA, A. Kalita, and T. Ojha", "title": "Traffic Prediction and Load-Aware Adaptive RAW Slot Allocation for IEEE 802.11ah IoT Networks", "venue": "IEEE Region 10 Conference (TENCON 2026)", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "R. Pradhan, P. Dattatray, A. Kalita, and M. Gurusamy", "title": "Reliability-Energy Tradeoff-aware Dynamic Service Placement in Edge-Enabled IoV Networks", "venue": "IEEE 104th Vehicular Technology Conference (VTC-Fall 2026)", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "J. Jiang, A. Kalita, A. Hazra, and M. Gurusamy", "title": "Structural Importance Driven Task Scheduling with Dependencies Using a Hybrid GNN-DRL Approach in Edge-Cloud Systems", "venue": "IEEE 104th Vehicular Technology Conference (VTC-Fall 2026)", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "A. Kalita", "title": "Talk with the Things: Integrating LLMs into IoT Networks", "venue": "IFIP Networking 2026 — CoGen-AI-FNC Workshop", "details": "Accepted", "link": "" },
    { "category": "Conference", "authors": "J. Jiang, A. Kalita, and M. Gurusamy", "title": "DGTS: Dependency-aware GNN-guided Proactive Task Scheduler for Cloud-Edge Systems", "venue": "IEEE Wireless Communications and Networking Conference (WCNC 2026)", "details": "Accepted", "link": "" }
  ],

  "grants": [
    { "title": "Improving the Performance of 6TiSCH and DSME-based IoT Networks", "sponsor": "ANRF, Govt. of India", "scheme": "PM-ECRG", "duration": "Jun 2025 – Jun 2028", "amount": "₹60.12 L", "role": "PI" },
    { "title": "IEEE 802.11ah UAV Networks in Mission-Critical Defense Environments", "sponsor": "TiHAN, IIT Hyderabad", "scheme": "R&D Collaborator’s Project", "duration": "Oct 2025 – Oct 2026", "amount": "₹21.9 L", "role": "PI" },
    { "title": "Resilience in Low-Power and Lossy Internet of Things Networks", "sponsor": "IIT (ISM) Dhanbad", "scheme": "Faculty Research Scheme", "duration": "Oct 2024 – Oct 2026", "amount": "₹19.89 L", "role": "PI" },
    { "title": "IoT Testbed for Advanced Research in Networks & AI-Enabled IoT Systems", "sponsor": "IIT (ISM) Dhanbad", "scheme": "Special Grant · Advanced Lab", "duration": "Oct 2024 – Oct 2026", "amount": "₹12.3 L", "role": "PI" }
  ]
};
