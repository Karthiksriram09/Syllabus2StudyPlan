
export const TOPIC_LIBRARY: Record<string, string[]> = {
  'data structures': [
    'Arrays and Strings','Linked Lists','Stacks and Queues','Hash Tables','Trees and BSTs','Heaps and Priority Queues','Graphs: BFS/DFS',
    'Greedy vs DP primer','Amortized analysis basics'
  ],
  'algorithms': [
    'Big-O complexity','Sorting (Merge/Quick/Heap)','Searching (Binary/Two Pointers)','Greedy Techniques','Dynamic Programming',
    'Backtracking','Graph Algorithms (Dijkstra, Bellman-Ford)','Divide and Conquer'
  ],
  'databases': [
    'ER Modeling','SQL CRUD','Joins and Aggregations','Normalization Forms','Transactions & ACID','Indexes & Query Plans','NoSQL basics'
  ],
  'operating systems': [
    'Processes & Threads','Scheduling','Memory Management & Paging','Synchronization (Mutex/Semaphore)','Deadlocks','File Systems','I/O & Virtualization'
  ],
  'computer networks': [
    'OSI vs TCP/IP','IP addressing & Subnets','TCP vs UDP','HTTP/HTTPS','DNS','Routing basics','CDN caching'
  ],
  'web': [
    'HTML/CSS/JS basics','HTTP methods & REST','Auth (Sessions/JWT)','Frontend frameworks overview','State management','API patterns'
  ],
  'ml': [
    'Supervised vs Unsupervised','Model evaluation metrics','Regularization','Feature Engineering','Tree-based models','Neural Networks basics',
    'Overfitting & Cross-validation'
  ],
  'ai': [
    'Search & Optimization','Knowledge representation','NLP basics','Computer Vision basics','Ethics & Bias','Prompting foundations'
  ],
  'java': [
    'OOP pillars','Collections Framework','Streams & Lambdas','JDBC/JPA basics','Spring Core & Boot overview','REST controllers','Exception handling & logging'
  ]
}

export const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'data structures': ['array','linked list','stack','queue','heap','graph','tree'],
  'algorithms': ['algorithm','sorting','search','dp','dynamic programming','greedy'],
  'databases': ['sql','database','normalization','transaction','acid','join','index'],
  'operating systems': ['process','thread','semaphore','paging','deadlock','filesystem','scheduling'],
  'computer networks': ['network','tcp','udp','ip','dns','routing','http','https'],
  'web': ['http','rest','frontend','backend','api','react','next','spring'],
  'ml': ['machine learning','regression','classification','model','training','feature'],
  'ai': ['artificial intelligence','prompt','nlp','vision','knowledge'],
  'java': ['java','spring','jdbc','jpa','hibernate']
}
