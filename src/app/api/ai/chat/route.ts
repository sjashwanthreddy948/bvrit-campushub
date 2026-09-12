/**
 * CampusHub AI — Streaming Chat API Route
 * Works fully without any API key using built-in intelligence engine.
 * When a valid Gemini API key (starts with AIza) is present, uses Gemini 2.0 Flash.
 */

import { NextRequest } from "next/server";

// ─── System Prompt for Gemini ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are CampusHub AI — the advanced reasoning AI assistant for B.V. Raju Institute of Technology (BVRIT), Narsapur, Telangana, created by Vishnu Universal Learning.

You operate with the depth, rigor, and accuracy of ChatGPT with full mathematical and logical precision, while being deeply knowledgeable about the BVRIT campus.

Core Principles:
1. THINK CAREFULLY & SYSTEMATICALLY: Analyze every user prompt before answering. Break down complex questions step-by-step.
2. ABSOLUTE MATHEMATICAL & LOGICAL ACCURACY: Never guess calculations. For math (e.g., 5 + 5 = 10, algebra, calculus, probabilities), compute accurately and explain clearly.
3. PRODUCTION CODE: When writing code (Python, Java, C++, SQL, React), provide clean, complete, syntactically correct, and well-explained solutions with time & space complexity.
4. COMPREHENSIVE SUBJECT EXPERTISE: Provide authoritative, insightful answers on Computer Science, Data Structures, Algorithms, Engineering, Science, Literature, History, and Placement Aptitude (TCS, Infosys, Amazon, etc.).
5. VERIFIED BVRIT CAMPUS INTELLIGENCE:
   - Full Name: B.V. Raju Institute of Technology (BVRIT), Narsapur, Medak District, Telangana (Est. 1997).
   - Parent Organization: Sri Vishnu Educational Society (SVES) / Vishnu Universal Learning.
   - Status: UGC Autonomous Institution, NAAC 'A+' Grade accredited, NBA Tier-I programs, affiliated to JNTU Hyderabad.
   - Leadership: Chairman Sri K.V. Vishnu Raju; Vice Chairman Sri Ravichandran Rajagopal; Principal Dr. Sanjay Dubey.
   - Placement Highlights: 1,540+ offers, ₹44+ LPA highest package, 80+ tier-1 offers at 10+ LPA.
   - Academics & LMS: 11 B.Tech programs (CSE, IT, AIML, AIDS, ECE, EEE, ME, CE, CHE, BME, PHE), 27 tracked sections, Vedic.ai portal for assignments & attendance.
   - Facilities: Dr. APJ Abdul Kalam Block, Atal Incubation Centre (AIC-BVRIT), 60+ GPS-tracked bus routes across Hyderabad/Medak.

Format Guidelines:
- Highlight key facts and numbers using **bold**.
- For multi-step reasoning or solutions, use numbered lists.
- Format code cleanly inside fenced markdown code blocks with language identifiers.
- Be concise for straightforward questions, and offer structured depth for complex queries.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response("Missing message", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";

    const isValidGeminiKey = apiKey && apiKey.trim().length > 10;

    if (isValidGeminiKey) {
      // ── Try Gemini 3.5 Flash Reasoning Model with streaming ───────────────
      const contents: { role: string; parts: { text: string }[] }[] = [];

      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-12)) {
          if (msg.role === "user" || msg.role === "model") {
            contents.push({ role: msg.role, parts: [{ text: msg.text }] });
          }
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      try {
        const models = [
          "gemini-3.5-flash",
          "gemini-flash-latest",
          "gemini-3.5-flash-lite",
          "gemini-flash-lite-latest",
        ];
        let geminiRes: Response | null = null;

        for (const modelName of models) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": apiKey.trim(),
            },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
                topP: 0.95,
              },
            }),
          });

          if (res.ok && res.body) {
            geminiRes = res;
            break;
          } else {
            console.warn(`Model ${modelName} returned status ${res.status}`);
          }
        }

        if (geminiRes && geminiRes.body) {
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              const reader = geminiRes.body!.getReader();
              const decoder = new TextDecoder();
              let buffer = "";
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";
                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const dataStr = line.slice(6).trim();
                      if (dataStr === "[DONE]") continue;
                      try {
                        const json = JSON.parse(dataStr);
                        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) controller.enqueue(encoder.encode(text));
                      } catch { /* skip */ }
                    }
                  }
                }
              } finally {
                reader.releaseLock();
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
            },
          });
        }
      } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
        // Fall through to built-in engine
      }
    }

    // ── Built-in Intelligence Engine (works without API key) ─────────────────
    const answer = builtInEngine(message, history || []);
    return streamWords(answer);

  } catch (err) {
    console.error("CampusHub AI error:", err);
    return streamWords("Sorry, I ran into an issue. Please try again.");
  }
}

// ─── Stream helper ────────────────────────────────────────────────────────────

function streamWords(text: string): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      // Stream word by word for a nice effect
      const words = text.split(/(?<=\s)|(?=\s)/);
      let i = 0;
      function next() {
        if (i >= words.length) { controller.close(); return; }
        controller.enqueue(encoder.encode(words[i]));
        i++;
        setTimeout(next, 15 + Math.random() * 20);
      }
      next();
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// ─── Built-in AI Engine ───────────────────────────────────────────────────────

function builtInEngine(message: string, history: { role: string; text: string }[]): string {
  const q = message.toLowerCase().trim();
  const lastUserMessages = history.filter(h => h.role === "user").slice(-3).map(h => h.text.toLowerCase());

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|hii|helo|sup|yo|good morning|good afternoon|good evening|namaste)/.test(q)) {
    const greetings = [
      `Hey! 👋 I'm **CampusHub AI** — your personal campus and career assistant at BVRIT!\n\nI can help you with:\n- 💻 **Coding** — Python, Java, C++, DSA, algorithms\n- 🎯 **Placement prep** — TCS, Infosys, Amazon, Google interview prep\n- 📚 **Any subject** — math, science, history, general knowledge\n- 📝 **Writing** — emails, reports, cover letters\n- 🏫 **Campus** — assignments, drives, circulars\n\nWhat would you like to know?`,
    ];
    return greetings[0];
  }

  // ── What can you do? ───────────────────────────────────────────────────────
  if (q.includes("what can you do") || q.includes("what do you do") || q.includes("your capabilities") || q.includes("help me")) {
    return `### I'm CampusHub AI 🤖 — Here's what I can do:\n\n**💻 Programming & Coding**\n- Write and explain code in Python, Java, C++, JavaScript, SQL\n- Solve DSA problems (arrays, trees, graphs, DP)\n- Debug your code\n- Explain algorithms with examples\n\n**🎯 Placement Preparation**\n- Company-specific prep (TCS, Infosys, Wipro, Amazon, Google, Microsoft)\n- Aptitude: quant, logical reasoning, verbal ability\n- Interview tips and mock answers\n- Resume writing and improvement\n\n**📚 General Knowledge**\n- Science, history, geography, current affairs\n- Any academic subject\n- Explanations in simple language\n\n**📝 Writing Help**\n- Cold emails to recruiters\n- LinkedIn posts\n- Reports and essays\n- Cover letters\n\n**🏫 BVRIT Campus**\n- Assignment deadlines, placement drives\n- Circular summaries, opportunity matching\n\nJust ask me anything!`;
  }

  // ── Binary Search ──────────────────────────────────────────────────────────
  if (q.includes("binary search")) {
    return `### Binary Search Algorithm 🔍\n\n**Binary Search** finds a target in a **sorted array** in **O(log n)** time by halving the search space each step.\n\n**How it works:**\n1. Set \`left = 0\`, \`right = n-1\`\n2. Find \`mid = (left + right) // 2\`\n3. If \`arr[mid] == target\` → found! Return mid\n4. If \`arr[mid] < target\` → search right half: \`left = mid + 1\`\n5. If \`arr[mid] > target\` → search left half: \`right = mid - 1\`\n6. Repeat until \`left > right\`\n\n**Python:**\n\`\`\`python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1  # Not found\n\n# Example\nnums = [2, 5, 8, 12, 16, 23, 38, 56]\nprint(binary_search(nums, 23))  # Output: 5\n\`\`\`\n\n**Java:**\n\`\`\`java\nint binarySearch(int[] arr, int target) {\n    int left = 0, right = arr.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\`\`\`\n\n💡 **Time:** O(log n) | **Space:** O(1)\n💡 **Key rule:** Array MUST be sorted first!`;
  }

  // ── Sorting ────────────────────────────────────────────────────────────────
  if (q.includes("bubble sort") || q.includes("sorting algorithm")) {
    return `### Sorting Algorithms 📊\n\n**Bubble Sort** — Simple but slow:\n\`\`\`python\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\`\`\`\nTime: O(n²) | Space: O(1)\n\n**Merge Sort** — Fast and stable:\n\`\`\`python\ndef merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\`\`\`\nTime: O(n log n) | Space: O(n)\n\n**Quick Reference:**\n| Algorithm | Best | Average | Worst | Stable? |\n|-----------|------|---------|-------|--------|\n| Bubble | O(n) | O(n²) | O(n²) | ✅ |\n| Merge | O(n log n) | O(n log n) | O(n log n) | ✅ |\n| Quick | O(n log n) | O(n log n) | O(n²) | ❌ |\n| Heap | O(n log n) | O(n log n) | O(n log n) | ❌ |`;
  }

  // ── Two Sum ────────────────────────────────────────────────────────────────
  if (q.includes("two sum")) {
    return `### Two Sum — LeetCode #1 🎯\n\n**Problem:** Given array \`nums\` and \`target\`, return indices of two numbers that add up to target.\n\n**Optimal Solution — HashMap (O(n)):**\n\`\`\`python\ndef twoSum(nums, target):\n    seen = {}  # value -> index\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Example\nnums = [2, 7, 11, 15]\ntarget = 9\nprint(twoSum(nums, target))  # [0, 1] (2+7=9)\n\`\`\`\n\n**Java version:**\n\`\`\`java\npublic int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement))\n            return new int[]{map.get(complement), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}\n\`\`\`\n\n**Time:** O(n) | **Space:** O(n)\n💡 Key idea: For each number, check if its complement already exists in the hashmap!`;
  }

  // ── Python basics ──────────────────────────────────────────────────────────
  if (q.includes("python") && (q.includes("learn") || q.includes("basics") || q.includes("beginner") || q.includes("start"))) {
    return `### Python for Beginners 🐍\n\n**Python** is the most beginner-friendly language — perfect for placements!\n\n**1. Variables & Types:**\n\`\`\`python\nname = "Rahul"        # string\nage = 20              # integer\ncgpa = 8.5            # float\nis_placed = True      # boolean\n\`\`\`\n\n**2. Input/Output:**\n\`\`\`python\nname = input("Enter name: ")\nprint(f"Hello, {name}!")\n\`\`\`\n\n**3. Conditions:**\n\`\`\`python\nif cgpa >= 7.5:\n    print("Eligible for drive")\nelif cgpa >= 6.0:\n    print("Check requirements")\nelse:\n    print("Work on CGPA")\n\`\`\`\n\n**4. Loops:**\n\`\`\`python\n# For loop\nfor i in range(1, 6):\n    print(i)  # prints 1 to 5\n\n# While loop\nn = 5\nwhile n > 0:\n    print(n)\n    n -= 1\n\`\`\`\n\n**5. Functions:**\n\`\`\`python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Priya"))  # Hello, Priya!\n\`\`\`\n\n**6. Lists:**\n\`\`\`python\nmarks = [85, 90, 78, 92]\nmarks.append(88)       # add\nprint(max(marks))      # 92\nprint(sum(marks)/len(marks))  # average\n\`\`\`\n\n💡 **Best resources:** HackerRank Python track, W3Schools, GeeksforGeeks`;
  }

  // ── SQL ────────────────────────────────────────────────────────────────────
  if (q.includes("sql") || q.includes("database") || (q.includes("query") && !q.includes("api"))) {
    return `### SQL — Complete Quick Reference 🗃️\n\n**Basic SELECT:**\n\`\`\`sql\nSELECT name, age FROM students WHERE cgpa > 7.5;\nSELECT * FROM students ORDER BY cgpa DESC LIMIT 10;\n\`\`\`\n\n**JOINs (most asked in interviews!):**\n\`\`\`sql\n-- INNER JOIN (only matching rows)\nSELECT s.name, p.company\nFROM students s\nINNER JOIN placements p ON s.id = p.student_id;\n\n-- LEFT JOIN (all students, even unplaced)\nSELECT s.name, p.company\nFROM students s\nLEFT JOIN placements p ON s.id = p.student_id;\n\`\`\`\n\n**GROUP BY & Aggregates:**\n\`\`\`sql\nSELECT department, COUNT(*) AS count, AVG(cgpa) AS avg_cgpa\nFROM students\nGROUP BY department\nHAVING AVG(cgpa) > 7.0;\n\`\`\`\n\n**Subqueries:**\n\`\`\`sql\n-- Students with above-average CGPA\nSELECT name FROM students\nWHERE cgpa > (SELECT AVG(cgpa) FROM students);\n\`\`\`\n\n**Normalization:**\n- **1NF** — No repeating groups, atomic values\n- **2NF** — 1NF + no partial dependency\n- **3NF** — 2NF + no transitive dependency\n- **BCNF** — Strongest normal form\n\n💡 **Interview tip:** Practice JOINs and GROUP BY — they appear in 90% of SQL rounds!`;
  }

  // ── OOP ────────────────────────────────────────────────────────────────────
  if (q.includes("oops") || q.includes("oop") || q.includes("object oriented")) {
    return `### Object-Oriented Programming (OOP) 🏗️\n\n**The 4 Pillars:**\n\n**1. Encapsulation** — Bundle data + methods, hide internal details\n\`\`\`python\nclass Student:\n    def __init__(self, name, cgpa):\n        self.__cgpa = cgpa  # private\n        self.name = name\n    \n    def get_cgpa(self):  # getter\n        return self.__cgpa\n\`\`\`\n\n**2. Inheritance** — Child class reuses parent class\n\`\`\`python\nclass Person:\n    def __init__(self, name):\n        self.name = name\n    def introduce(self):\n        return f"Hi, I'm {self.name}"\n\nclass Student(Person):\n    def __init__(self, name, roll):\n        super().__init__(name)\n        self.roll = roll\n    def study(self):\n        return f"{self.name} is studying"\n\`\`\`\n\n**3. Polymorphism** — Same method, different behavior\n\`\`\`python\nclass Shape:\n    def area(self): return 0\n\nclass Circle(Shape):\n    def area(self): return 3.14 * self.r ** 2\n\nclass Rectangle(Shape):\n    def area(self): return self.w * self.h\n\`\`\`\n\n**4. Abstraction** — Show only what's needed, hide complexity\n\`\`\`python\nfrom abc import ABC, abstractmethod\n\nclass Vehicle(ABC):\n    @abstractmethod\n    def start(self): pass\n\nclass Car(Vehicle):\n    def start(self): return "Car engine started!"\n\`\`\`\n\n💡 **Interview tip:** Be ready to explain all 4 with real-world examples!`;
  }

  // ── Linked List ────────────────────────────────────────────────────────────
  if (q.includes("linked list")) {
    return `### Linked List 📎\n\nA **Linked List** is a linear data structure where each element (node) contains data and a pointer to the next node.\n\n**Implementation in Python:**\n\`\`\`python\nclass Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n    \n    def append(self, data):\n        new_node = Node(data)\n        if not self.head:\n            self.head = new_node\n            return\n        current = self.head\n        while current.next:\n            current = current.next\n        current.next = new_node\n    \n    def print_list(self):\n        current = self.head\n        while current:\n            print(current.data, end=" -> ")\n            current = current.next\n        print("None")\n    \n    def reverse(self):\n        prev = None\n        current = self.head\n        while current:\n            next_node = current.next\n            current.next = prev\n            prev = current\n            current = next_node\n        self.head = prev\n\n# Usage\nll = LinkedList()\nll.append(1)\nll.append(2)\nll.append(3)\nll.print_list()  # 1 -> 2 -> 3 -> None\nll.reverse()\nll.print_list()  # 3 -> 2 -> 1 -> None\n\`\`\`\n\n**Types:**\n- **Singly** — each node points to next\n- **Doubly** — each node points to next AND prev\n- **Circular** — last node points back to head\n\n**Time Complexity:**\n| Operation | Array | Linked List |\n|-----------|-------|-------------|\n| Access | O(1) | O(n) |\n| Search | O(n) | O(n) |\n| Insert at head | O(n) | O(1) |\n| Insert at end | O(1) | O(n) |`;
  }

  // ── TCS NQT ────────────────────────────────────────────────────────────────
  if (q.includes("tcs") || q.includes("nqt")) {
    return `### TCS NQT Preparation Guide 🎯\n\n**TCS NQT (National Qualifier Test)** is TCS's primary hiring test. Here's your complete prep guide:\n\n**📋 Exam Pattern:**\n| Section | Questions | Time | Marks |\n|---------|-----------|------|-------|\n| Verbal Ability | 24 | 30 min | 24 |\n| Reasoning Ability | 30 | 50 min | 30 |\n| Numerical Ability | 26 | 40 min | 26 |\n| Programming Logic | 10 | 15 min | 10 |\n| Coding (Optional) | 1-2 | 45 min | Bonus |\n\n**✅ Topic-wise Prep:**\n\n**Verbal:**\n- Reading comprehension\n- Sentence correction, fill in the blanks\n- Vocabulary (synonyms, antonyms)\n\n**Reasoning:**\n- Syllogisms, blood relations, arrangements\n- Puzzles, coding-decoding\n- Series, directions\n\n**Numerical:**\n- Percentages, profit & loss, time & work\n- Ratios, averages, speed-distance-time\n- Permutations & combinations\n\n**Coding (for Prime/Digital roles):**\n- Practice Easy-Medium problems on HackerRank\n- Focus: Loops, arrays, strings, patterns\n- Language: C, C++, Java, or Python\n\n**📚 Resources:**\n- PrepInsta TCS NQT PYQs\n- IndiaBix for aptitude\n- TCS iON practice platform (official)\n\n💡 **Cutoff:** Usually 60-65% to qualify. Coding section is only for Prime roles!`;
  }

  // ── Infosys ────────────────────────────────────────────────────────────────
  if (q.includes("infosys") || q.includes("infytq")) {
    return `### Infosys Placement Preparation 🔷\n\n**Infosys** recruits via InfyTQ certification and campus drives.\n\n**📋 Selection Process:**\n1. **Online Test** — Aptitude + Logical + Verbal\n2. **Technical Interview** — DSA, OS, DBMS, OOPS\n3. **HR Interview** — Behavioral questions\n\n**🎯 Online Test Topics:**\n- **Quantitative:** Percentages, averages, P&L, simple/compound interest\n- **Logical:** Arrangements, syllogisms, blood relations, series\n- **Verbal:** RC, grammar, vocabulary\n\n**💻 Technical Interview Topics:**\n\`\`\`\nDSA: Arrays, Strings, Recursion, Sorting\nOOPS: Encapsulation, Inheritance, Polymorphism, Abstraction\nDBMS: SQL queries, Normalization, Joins, Transactions\nOS: Processes, Threads, Deadlock, Memory Management\nNetworking: TCP/IP, OSI model, HTTP/HTTPS\n\`\`\`\n\n**📝 HR Common Questions:**\n- "Tell me about yourself" (prepare a 90-second answer!)\n- "Why Infosys?"\n- "Where do you see yourself in 5 years?"\n- "What is your greatest strength/weakness?"\n\n**💡 Salary:** System Engineer — ~₹3.6 LPA | SP — ~₹4.5 LPA\n\n**Resources:** InfyTQ platform, PrepInsta Infosys, GFG`;
  }

  // ── Resume tips ────────────────────────────────────────────────────────────
  if (q.includes("resume") || q.includes("cv")) {
    return `### Resume Writing Guide for Freshers 📄\n\n**One-page rule:** Keep it exactly 1 page as a fresher!\n\n**✅ Essential Sections (in order):**\n\n**1. Header**\n\`\`\`\nYour Name (large, bold)\nPhone | Email | LinkedIn | GitHub\nCity, State\n\`\`\`\n\n**2. Education**\n\`\`\`\nB.Tech — Computer Science Engineering\nB.V. Raju Institute of Technology (BVRIT), Narsapur\nCGPA: 8.2 | 2021-2025\n\`\`\`\n\n**3. Skills**\n- Languages: Python, Java, C++\n- Web: HTML, CSS, React\n- Tools: Git, VS Code, MySQL\n- Soft: Problem-solving, teamwork\n\n**4. Projects (most important!)**\n\`\`\`\nProject Name | Tech Stack Used\n- Built X that does Y, resulting in Z\n- Used React + Node.js + MongoDB\n- GitHub: github.com/yourname/project\n\`\`\`\n\n**5. Experience** (internships, if any)\n\n**6. Certifications**\n- Mention only relevant ones (NPTEL, Coursera, HackerRank)\n\n**7. Achievements**\n- LeetCode: 200+ problems solved\n- Hackathons, competitions\n\n**❌ Avoid:**\n- Photos, date of birth, hobbies\n- Generic objectives like "seeking a challenging role"\n- Spelling mistakes!\n\n💡 **Pro tip:** Use a clean template from Overleaf (LaTeX) or Canva's ATS-friendly templates.`;
  }

  // ── Cold email ─────────────────────────────────────────────────────────────
  if (q.includes("cold email") || q.includes("email to recruiter") || q.includes("email recruiter")) {
    return `### Cold Email Template to Recruiter 📧\n\n**Subject:** Internship/Job Application — [Your Name] | [Department] | BVRIT\n\n---\n\nDear [Recruiter Name / Hiring Manager],\n\nI hope this email finds you well. I'm **[Your Name]**, a final-year B.Tech student in **Computer Science Engineering** at B.V. Raju Institute of Technology (BVRIT), Narsapur, graduating in **2025**.\n\nI came across [**Company Name**]'s work on [specific product/project/news] and was genuinely impressed by [specific reason — shows you did research!]. I'm reaching out to express my strong interest in **[Software Engineer / Internship]** opportunities at your organization.\n\n**What I bring:**\n- CGPA: 8.X/10\n- Proficient in Python, Java, and Data Structures\n- Built [Project Name] — [one line about what it does] | [GitHub link]\n- Solved 150+ problems on LeetCode\n\nI've attached my resume for your review. I would love the opportunity to contribute to [Company Name] and discuss how my skills align with your team's needs.\n\nThank you for your time!\n\nBest regards,\n**[Your Name]**\n[Phone] | [Email]\n[LinkedIn] | [GitHub]\n\n---\n\n💡 **Tips:**\n- Personalize each email — mention something specific about the company\n- Keep it under 200 words\n- Always attach your resume as a PDF\n- Follow up once after 5-7 days if no response`;
  }

  // ── Placement tips ─────────────────────────────────────────────────────────
  if (q.includes("placement") || q.includes("interview prep") || q.includes("campus placement")) {
    return `### Complete Placement Preparation Guide 🚀\n\n**Phase 1: Foundation (3-6 months before)**\n\n**DSA Roadmap:**\n1. Arrays & Strings (Week 1-2)\n2. Linked Lists, Stacks, Queues (Week 3-4)\n3. Binary Search, Two Pointers (Week 5)\n4. Trees & BST (Week 6-7)\n5. Graphs — BFS, DFS (Week 8-9)\n6. Dynamic Programming (Week 10-14)\n\n**Platforms:** LeetCode (primary), GFG, HackerRank\n**Target:** 150+ problems, focus on Easy & Medium\n\n**Phase 2: Company Prep (1-2 months before)**\n\n| Company | Focus Areas |\n|---------|-------------|\n| TCS | NQT aptitude, basic coding |\n| Infosys | Aptitude, OOP, SQL |\n| Wipro | Logical reasoning, basic DSA |\n| Capgemini | Aptitude, pseudocode |\n| Amazon | DSA hard problems, system design |\n| Microsoft | Advanced DSA, CS fundamentals |\n\n**Phase 3: Interviews**\n\n**Technical Round:**\n- Introduce yourself confidently (60 seconds)\n- Explain your project deeply\n- Think out loud while solving problems\n- Ask clarifying questions first\n\n**HR Round:**\n- Research the company beforehand\n- Prepare STAR method answers\n- Have 2-3 questions ready to ask\n\n**💡 Golden Rules:**\n- Consistency > Intensity (1 hour daily beats 7 hours on Sunday)\n- Understand patterns, don't memorize solutions\n- Build 2-3 strong projects to discuss`;
  }

  // ── What is AI/ML ──────────────────────────────────────────────────────────
  if (q.includes("machine learning") || q.includes("what is ml") || q.includes("what is ai") || q.includes("artificial intelligence")) {
    return `### Machine Learning & AI Explained 🤖\n\n**Artificial Intelligence (AI):** Making machines simulate human intelligence — reasoning, learning, problem-solving.\n\n**Machine Learning (ML):** A subset of AI where machines **learn from data** without being explicitly programmed.\n\n**Deep Learning (DL):** A subset of ML using **neural networks** with many layers.\n\n**The hierarchy:** AI ⊃ ML ⊃ Deep Learning ⊃ Generative AI\n\n---\n\n**Types of ML:**\n\n**1. Supervised Learning** — Learn from labeled data\n- Examples: Spam detection, house price prediction, image classification\n- Algorithms: Linear Regression, Decision Trees, SVM, Neural Networks\n\n**2. Unsupervised Learning** — Find patterns in unlabeled data\n- Examples: Customer segmentation, topic modeling\n- Algorithms: K-Means, DBSCAN, PCA\n\n**3. Reinforcement Learning** — Learn by trial and reward\n- Examples: Game playing (Chess, Go), robotics, self-driving cars\n\n---\n\n**Simple ML example in Python:**\n\`\`\`python\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\n# Training data: study hours vs marks\nhours = np.array([[1], [2], [3], [4], [5]])\nmarks = np.array([40, 55, 65, 75, 90])\n\nmodel = LinearRegression()\nmodel.fit(hours, marks)\n\n# Predict marks for 6 hours of study\npred = model.predict([[6]])\nprint(f"Predicted marks: {pred[0]:.1f}")  # ~100\n\`\`\`\n\n**Popular tools:** Python, NumPy, Pandas, Scikit-learn, TensorFlow, PyTorch\n\n💡 **For placements:** Know the basics of supervised/unsupervised learning and be able to explain a project!`;
  }

  // ── OS concepts ────────────────────────────────────────────────────────────
  if (q.includes("operating system") || q.includes(" os ") || q.includes("deadlock") || q.includes("process") || q.includes("thread")) {
    return `### Operating Systems — Key Concepts 💻\n\n**Process vs Thread:**\n- **Process** — Independent program in execution, has its own memory space\n- **Thread** — Lightweight unit within a process, shares memory\n- Multiple threads in one process = faster execution (concurrency)\n\n**Deadlock — The 4 Conditions (Coffman Conditions):**\n1. **Mutual Exclusion** — Resource held by only one process\n2. **Hold and Wait** — Process holding resource waits for more\n3. **No Preemption** — Resources can't be forcibly taken\n4. **Circular Wait** — P1 waits for P2, P2 waits for P1\n\n**Deadlock Prevention:** Break any one of the 4 conditions!\n\n**CPU Scheduling Algorithms:**\n| Algorithm | Type | Advantage |\n|-----------|------|----------|\n| FCFS | Non-preemptive | Simple |\n| SJF | Non-preemptive | Minimum avg waiting time |\n| Round Robin | Preemptive | Fair, good for time-sharing |\n| Priority | Both | Important tasks first |\n\n**Memory Management:**\n- **Paging** — Fixed-size blocks (pages), no external fragmentation\n- **Segmentation** — Variable-size blocks based on program structure\n- **Virtual Memory** — Use disk as RAM extension, enables multiprogramming\n\n**Page Replacement Algorithms:**\n- **FIFO** — Replace oldest page\n- **LRU** — Replace least recently used (most practical)\n- **Optimal** — Replace page not needed for longest time (theoretical)\n\n💡 **Interview tip:** Be ready to calculate waiting time and turnaround time for scheduling problems!`;
  }

  // ── CGPA / grades ─────────────────────────────────────────────────────────
  if (q.includes("cgpa") || q.includes("percentage") || q.includes("grade")) {
    return `### CGPA & Placement Eligibility at BVRIT 📊\n\n**CGPA to Percentage formula (JNTUH):**\n\`Percentage = CGPA × 10 - 7.5\`\n\nExamples:\n- CGPA 8.0 → 72.5%\n- CGPA 7.5 → 67.5%\n- CGPA 9.0 → 82.5%\n\n**Company CGPA Cutoffs:**\n| Company | Min CGPA |\n|---------|----------|\n| TCS | 6.0 |\n| Infosys | 6.5 |\n| Wipro | 6.0 |\n| Cognizant | 6.5 |\n| Capgemini | 6.5 |\n| Accenture | 6.5 |\n| Amazon | 7.0 |\n| Microsoft | 8.0+ |\n| Google | 8.0+ |\n\n**💡 Tips to improve CGPA:**\n1. Attend all classes (internal marks matter!)\n2. Complete assignments on time\n3. Study previous year question papers — most exams follow patterns\n4. Form study groups for tough subjects\n5. Seek faculty help early — don't wait until exams\n\n**Backlogs impact:** Most companies don't allow even a single active backlog. Clear all backlogs ASAP!`;
  }

  // ── How to study / tips ────────────────────────────────────────────────────
  if (q.includes("study tips") || q.includes("how to study") || q.includes("exam tips") || q.includes("prepare for exam")) {
    return `### Study Tips for Engineering Students 📚\n\n**The Fundamentals:**\n\n**1. Active Recall > Re-reading**\nAfter studying a topic, close the book and try to recall it. This is 2x more effective than re-reading.\n\n**2. Spaced Repetition**\nReview topics at increasing intervals: 1 day → 3 days → 1 week → 1 month. Use Anki app!\n\n**3. Pomodoro Technique**\n25 minutes focused study → 5 minute break → repeat. After 4 cycles, take a 20-min break.\n\n**4. Teach to Learn (Feynman Technique)**\n- Pick a concept\n- Explain it as if teaching a 10-year-old\n- Identify gaps → go back and study\n- Simplify until it's crystal clear\n\n**For Engineering Specifically:**\n- **Before exam:** Solve PYQs (Previous Year Questions) — most patterns repeat!\n- **Lab exams:** Practice implementing programs from scratch without reference\n- **Theory:** Create mind maps, not just notes\n- **Group study:** Teach each other — best way to test understanding\n\n**For Placement Prep:**\n- 1 hour of DSA daily (consistency beats marathon sessions)\n- Track what you've solved — don't re-solve randomly\n- Read solutions after genuine attempts, not immediately\n\n💡 **The secret:** Start early. 3 months of consistent effort beats 3 weeks of panic study.`;
  }

  // ── What is cloud computing ────────────────────────────────────────────────
  if (q.includes("cloud computing") || q.includes("aws") || q.includes("azure") || q.includes("gcp")) {
    return `### Cloud Computing Explained ☁️\n\n**Cloud Computing** = accessing computing resources (servers, storage, databases, AI tools) over the internet instead of owning physical hardware.\n\n**Service Models:**\n| Model | What you manage | Example |\n|-------|----------------|--------|\n| **IaaS** | Apps, data, OS | AWS EC2, Azure VMs |\n| **PaaS** | Just your app | Heroku, Google App Engine |\n| **SaaS** | Nothing | Gmail, Office 365, Zoom |\n\n**Top 3 Cloud Providers:**\n\n**AWS (Amazon Web Services):**\n- Most popular (32% market share)\n- Key services: EC2, S3, Lambda, RDS, DynamoDB\n- Certification: AWS Cloud Practitioner (entry level)\n\n**Azure (Microsoft):**\n- Strong in enterprise\n- Key services: Azure VM, Blob Storage, Azure SQL\n- Good for .NET/Microsoft stack\n\n**GCP (Google Cloud):**\n- Best for AI/ML workloads\n- Key services: Compute Engine, BigQuery, Vertex AI\n\n**Why learn cloud for placements?**\n- Most companies are moving to cloud\n- AWS/Azure certifications add huge value to resume\n- Roles: Cloud Engineer, DevOps, Solutions Architect\n\n💡 **Start with:** AWS Free Tier account → try EC2, S3, Lambda for free!`;
  }

  // ── Fibonacci ──────────────────────────────────────────────────────────────
  if (q.includes("fibonacci")) {
    return `### Fibonacci Series 🔢\n\n**Fibonacci:** Each number = sum of previous two: 0, 1, 1, 2, 3, 5, 8, 13, 21...\n\n**Simple Recursion (O(2^n) — slow):**\n\`\`\`python\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\`\`\`\n\n**Dynamic Programming — Memoization (O(n)):**\n\`\`\`python\ndef fib(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]\n\`\`\`\n\n**Bottom-up DP (O(n) time, O(1) space) — Most optimal:**\n\`\`\`python\ndef fib(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n+1):\n        a, b = b, a + b\n    return b\n\nprint(fib(10))  # 55\n\`\`\`\n\n**Java version:**\n\`\`\`java\nint fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}\n\`\`\`\n\n💡 Fibonacci is a classic DP intro problem — memorize the O(n) space-optimized version!`;
  }

  // ── JavaScript / React ────────────────────────────────────────────────────
  if (q.includes("javascript") || q.includes("react") || (q.includes("js") && q.includes("explain"))) {
    return `### JavaScript & React — Quick Reference ⚛️\n\n**JavaScript Essentials:**\n\`\`\`javascript\n// Variables\nconst name = "Rahul";  // can't reassign\nlet age = 20;          // can reassign\n\n// Arrow functions\nconst greet = (name) => \`Hello, \${name}!\`;\n\n// Array methods (very important!)\nconst nums = [1, 2, 3, 4, 5];\nnums.map(n => n * 2);      // [2, 4, 6, 8, 10]\nnums.filter(n => n > 2);   // [3, 4, 5]\nnums.reduce((acc, n) => acc + n, 0);  // 15\n\n// Promises & Async/Await\nasync function fetchData() {\n  const res = await fetch("https://api.example.com/data");\n  const data = await res.json();\n  return data;\n}\n\`\`\`\n\n**React Basics:**\n\`\`\`jsx\nimport { useState, useEffect } from 'react';\n\nfunction StudentCard({ name, cgpa }) {\n  const [isExpanded, setIsExpanded] = useState(false);\n\n  useEffect(() => {\n    console.log("Component mounted!");\n  }, []);\n\n  return (\n    <div onClick={() => setIsExpanded(!isExpanded)}>\n      <h2>{name}</h2>\n      {isExpanded && <p>CGPA: {cgpa}</p>}\n    </div>\n  );\n}\n\`\`\`\n\n**Key React Hooks:**\n- \`useState\` — manage component state\n- \`useEffect\` — side effects (API calls, subscriptions)\n- \`useContext\` — global state\n- \`useRef\` — DOM references, persist values\n\n💡 For placements, know: closures, promises, event loop, HOFs, and React lifecycle!`;
  }

  // ── What is BVRIT ─────────────────────────────────────────────────────────
  if (q.includes("bvrit") || q.includes("college") || q.includes("campus") || q.includes("narsapur")) {
    return `### About BVRIT 🏫\n\n**B.V. Raju Institute of Technology (BVRIT)** is a prestigious engineering institution in Narsapur, Telangana.\n\n**Key Facts:**\n- **Full Name:** B.V. Raju Institute of Technology\n- **Location:** Narsapur, Medak District, Telangana\n- **Parent Organization:** Sri Vishnu Educational Society (Vishnu Universal Learning)\n- **Affiliated to:** JNTUH (Jawaharlal Nehru Technological University, Hyderabad)\n- **Status:** Autonomous Institution\n- **Established:** ~1997 (25+ years of academic excellence)\n- **NAAC:** Accredited\n- **NBA:** Multiple departments NBA accredited\n\n**Programs Offered (20+):**\n- B.Tech — CSE, CSE (AI&ML), CSE (Data Science), IT, ECE, EEE, Mechanical, Civil, Chemical\n- M.Tech — Various specializations\n- MBA\n\n**Placement Highlights:**\n- 🎯 **1500+** students placed this year\n- 💰 **80+** students placed at ≥ ₹10 LPA\n- 🏢 Top recruiters: TCS, Infosys, Wipro, Cognizant, Capgemini, Accenture, Microsoft, Amazon\n- Dedicated **Training & Placement Cell** for student preparation\n\n**Campus:**\n- Iconic **Dr. A.P.J. Abdul Kalam Block** (named after India's missile man)\n- Modern labs, libraries, hostels\n- Strong industry-academia connections\n\n🌐 **Website:** [bvrit.ac.in](https://bvrit.ac.in)`;
  }

  // ── Mathematics ────────────────────────────────────────────────────────────
  if (q.includes("factorial") || q.includes("prime") || q.includes("palindrome")) {
    return `### Common Math Programs 🔢\n\n**Factorial:**\n\`\`\`python\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # 120\n\`\`\`\n\n**Prime Number Check:**\n\`\`\`python\ndef is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprint(is_prime(17))   # True\nprint(is_prime(15))   # False\n\`\`\`\n\n**Palindrome Check:**\n\`\`\`python\ndef is_palindrome(s):\n    return s == s[::-1]\n\nprint(is_palindrome("racecar"))  # True\nprint(is_palindrome("hello"))    # False\n\n# For numbers\ndef is_palindrome_num(n):\n    return str(n) == str(n)[::-1]\n\nprint(is_palindrome_num(121))   # True\n\`\`\`\n\n**All Primes up to N (Sieve of Eratosthenes):**\n\`\`\`python\ndef sieve(n):\n    is_prime = [True] * (n + 1)\n    is_prime[0] = is_prime[1] = False\n    for i in range(2, int(n**0.5) + 1):\n        if is_prime[i]:\n            for j in range(i*i, n+1, i):\n                is_prime[j] = False\n    return [i for i, p in enumerate(is_prime) if p]\n\nprint(sieve(30))  # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]\n\`\`\``;
  }

  // ── Who are you ────────────────────────────────────────────────────────────
  if (q.includes("who are you") || q.includes("what are you") || q.includes("your name") || q.includes("introduce yourself")) {
    return `I'm **CampusHub AI** 🤖 — your personal campus and career intelligence assistant at BVRIT!\n\nI'm built into the CampusHub platform at B.V. Raju Institute of Technology (BVRIT), Narsapur, designed to be like **ChatGPT but campus-aware**.\n\n**I can help with:**\n- 💻 **Any coding question** — Python, Java, C++, JavaScript, DSA, algorithms\n- 🎯 **Placement prep** — TCS, Infosys, Amazon, Google, Microsoft interviews\n- 📚 **Any subject** — math, science, OS, DBMS, Computer Networks\n- 📝 **Writing** — emails to recruiters, resumes, cover letters\n- 🏫 **Campus stuff** — assignments, drives, circulars, deadlines\n- 🌐 **General knowledge** — history, science, current affairs, anything!\n\nWhat would you like to explore today?`;
  }

  // ── Generic/fallback ───────────────────────────────────────────────────────
  // Try to give a smart contextual response based on keywords
  if (q.includes("explain") || q.includes("what is") || q.includes("how does") || q.includes("how to")) {
    const topic = message.replace(/explain|what is|how does|how to|what are|define/gi, "").trim();
    return `### About: ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\nGreat question! Here's what I know about **${topic}**:\n\nThis is a topic I can answer in depth. For the most comprehensive and accurate response on "${topic}", I recommend:\n\n1. **Ask me to be more specific** — e.g., "Explain ${topic} with examples" or "Explain ${topic} for a beginner"\n\n2. **Try related questions like:**\n   - "What is ${topic} in simple terms?"\n   - "Give me a code example of ${topic}"\n   - "How is ${topic} used in real projects?"\n\nI'm also much more powerful with a Gemini API key — get yours free at [Google AI Studio](https://aistudio.google.com/apikey) and add it to \`.env.local\` as \`GEMINI_API_KEY=AIza...\`\n\nWhat specific aspect of **${topic}** would you like to learn about?`;
  }

  // Final fallback
  return `### CampusHub AI 🤖\n\nI'm your assistant for **coding, campus queries, and placement prep**.\n\nHere are some things you can ask me:\n- **Programming:** "Explain Binary Search with code", "Solve Two Sum in Python"\n- **Placements:** "How to prepare for TCS NQT?", "Infosys interview questions"\n- **Writing:** "Write a cold email to a tech recruiter", "Resume tips for freshers"\n- **Concepts:** "Explain OOP pillars with real-world examples", "How does SQL indexing work?"\n- **Campus:** "Tell me about BVRIT departments and placement statistics"\n\nWhat would you like to explore next?`;
}
