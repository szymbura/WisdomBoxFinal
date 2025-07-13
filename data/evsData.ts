export interface WisdomBlock {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  interactiveContent?: {
    title: string;
    text: string;
  }[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'online' | 'offline' | 'maintenance';
  wisdomBlocks: WisdomBlock[];
}

export const evsProducts: Product[] = [
  {
    id: 'ipdirector',
    title: 'IPDirector',
    description: 'Live production control and switching solution',
    icon: 'monitor',
    status: 'online',
    wisdomBlocks: [
      {
        id: 'ipdirector-workflow-basics',
        title: 'IPDirector: User Playbook',
        description: 'The Ultimate Creative Hub for Broadcast Production',
        content: 'IPDirector, a cornerstone of the EVS suite, is a powerhouse tool that redefines efficiency, creativity, and control in broadcast operations. By seamlessly blending robust hardware with intuitive Windows-based software, it delivers a familiar and streamlined media management experience, even for those new to EVS systems. Whether you\'re crafting highlight reels, managing live replays, or orchestrating complex playlists, IPDirector empowers your team to focus on storytelling, not technicalities.',
        tags: ['ipdirector', 'media-management', 'editing', 'interface'],
        interactiveContent: [
          {
            title: "IPDirector: The Ultimate Creative Hub for Broadcast Production",
            text: "IPDirector, a cornerstone of the EVS suite, is a powerhouse tool that redefines efficiency, creativity, and control in broadcast operations. By seamlessly blending robust hardware with intuitive Windows-based software, it delivers a familiar and streamlined media management experience, even for those new to EVS systems. Whether you're crafting highlight reels, managing live replays, or orchestrating complex playlists, IPDirector empowers your team to focus on storytelling, not technicalities."
          },
          {
            title: "Intuitive Windows-Based Interface",
            text: "Unlike traditional replay or server control panels reliant on rigid \"pages\" and \"banks,\" IPDirector introduces a modern, visual, and user-friendly interface designed for speed and simplicity. Key features include:\n\n• Visual Clip Management: Thumbnails and metadata for every clip enable quick identification, previewing, and organization.\n• Powerful Search Tools: A robust search bar instantly locates clips across all connected EVS servers, with advanced filtering for precision.\n• Multi-Window Workflow: Work seamlessly across multiple bins, playlists, and tasks in a flexible, multi-window environment.\n\nThis intuitive design ensures operators can navigate with ease, boosting productivity in high-pressure broadcast settings."
          },
          {
            title: "Streamlined Content Control",
            text: "IPDirector transforms media workflows by offering unparalleled flexibility in content management:\n\n• Effortless File Operations: Ingest, export, and import files using familiar Windows-like logic, with drag-and-drop functionality between directories and servers.\n• Networked Access: Instantly access and manage clips across any connected EVS server, ensuring real-time collaboration.\n• Live Editing & Replays: Edit clips, create slow-motion sequences, and manage assets on the fly, keeping your production dynamic and responsive.\n\nBy centralizing these functions, IPDirector frees creative teams to prioritize storytelling over file management."
          },
          {
            title: "Advanced Timeline Editing with IP Edit",
            text: "At the heart of IPDirector's creative power is IP Edit, a robust timeline editing tool that rivals top-tier non-linear editors while staying fully integrated with the EVS ecosystem. Key capabilities include:\n\n• Visual Timeline: Arrange, trim, and combine clips directly on an intuitive timeline, designed for live production speed.\n• Instant Previews: See edit results in real time, enabling fast decision-making in high-stakes environments.\n• Drag-and-Drop Highlights: Build and refine highlight packages or full playlists with minimal effort, streamlining production workflows."
          },
          {
            title: "Sophisticated Playlist Management",
            text: "IPDirector and IP Edit elevate playlist creation with advanced features tailored for complex productions:\n\n• Dynamic Playlist Functions: Go beyond basic sequencing with tools for show rundowns, dynamic edits, and flexible playlist assembly.\n• Virtual Elements: Incorporate placeholders, virtual clips, or dynamic elements into playlists for adaptable live production.\n• Color Coding: Assign colors to clips and playlist segments to quickly identify key moments, transitions, or ad breaks.\n• Breaks and Pauses: Insert breaks to control broadcast flow, ensuring seamless pacing.\n• Timed Playback: Schedule clips or playlists to start automatically, ideal for automated rundowns or precise playout.\n• Comprehensive Editing: Use the timeline to edit individual clips or entire playlists, supporting advanced workflows like segmenting, merging, or refining highlight reels."
          },
          {
            title: "The Heart of Live Production",
            text: "With its blend of reliable hardware and innovative software, IPDirector serves as a creative hub within the EVS server network. Whether managing hundreds of clips, assembling highlight reels on the fly, or scheduling intricate playlists, IPDirector and IP Edit deliver unmatched efficiency and intuition. This powerful tool empowers broadcast teams to create compelling content with confidence, making it an indispensable asset for live production."
          }
        ]
      },
      {
        id: 'ipdirector-troubleshooting',
        title: 'Troubleshooting Guide',
        description: 'Common issues and solutions for IPDirector',
        content: 'Common IPDirector issues and their solutions:\n\n1. Audio sync problems:\n- Check audio delay settings\n- Verify audio routing configuration\n- Ensure proper frame rate matching\n\n2. Video quality issues:\n- Verify source resolution settings\n- Check network bandwidth\n- Review compression settings\n\n3. Control surface issues:\n- Restart control application\n- Check network connectivity\n- Verify user permissions\n\n4. Recording problems:\n- Check available storage space\n- Verify recording format settings\n- Review file naming conventions',
        tags: ['troubleshooting', 'audio', 'video', 'technical']
      },
      {
        id: 'ipdirector-advanced-features',
        title: 'Advanced Features',
        description: 'Advanced IPDirector capabilities and configurations',
        content: 'Advanced IPDirector features for professional production:\n\n1. Multi-site production:\n- Remote control capabilities\n- Cloud-based workflows\n- Distributed production setups\n\n2. Custom scripting:\n- Automation scripts\n- Custom control panels\n- Integration with third-party systems\n\n3. Advanced audio processing:\n- Surround sound mixing\n- Audio effects and processing\n- Multi-language audio handling\n\n4. Graphics and effects:\n- Real-time compositing\n- Virtual studio technology\n- Advanced keying techniques',
        tags: ['advanced', 'automation', 'graphics', 'audio']
      }
    ]
  },
  {
    id: 'multicam-lsm',
    title: 'Multicam LSM',
    description: 'Multi-camera live slow motion replay system',
    icon: 'camera',
    status: 'online',
    wisdomBlocks: [
      {
        id: 'multicam-lsm-setup',
        title: 'System Setup',
        description: 'Initial configuration and setup procedures',
        content: 'Setting up Multicam LSM for optimal performance:\n\n1. Hardware configuration:\n- Server specifications and requirements\n- Camera input connections\n- Network setup and bandwidth considerations\n- Storage configuration for high-speed recording\n\n2. Software configuration:\n- Camera channel assignments\n- Recording format settings\n- Replay template creation\n- User interface customization\n\n3. Calibration procedures:\n- Camera synchronization\n- Color matching between cameras\n- Audio alignment\n- Timing calibration\n\n4. Testing and validation:\n- Record test sequences\n- Verify replay functionality\n- Check all control interfaces\n- Validate backup procedures',
        tags: ['setup', 'configuration', 'hardware', 'calibration']
      },
      {
        id: 'multicam-lsm-operations',
        title: 'Live Operations',
        description: 'Best practices for live multicam replay operations',
        content: 'Live operations best practices for Multicam LSM:\n\n1. Pre-event preparation:\n- Load event templates\n- Test all camera angles\n- Verify storage capacity\n- Check network connectivity\n\n2. During live operations:\n- Monitor recording status continuously\n- Use keyboard shortcuts for efficiency\n- Maintain awareness of storage usage\n- Coordinate with production team\n\n3. Replay creation:\n- Select optimal camera angles\n- Use smooth speed ramping\n- Apply appropriate effects\n- Maintain consistent replay duration\n\n4. Emergency procedures:\n- Backup system activation\n- Quick recovery methods\n- Alternative replay sources\n- Communication protocols',
        tags: ['live', 'operations', 'replay', 'workflow']
      },
      {
        id: 'multicam-lsm-maintenance',
        title: 'Maintenance Guide',
        description: 'Regular maintenance and optimization procedures',
        content: 'Maintenance procedures for Multicam LSM:\n\n1. Daily maintenance:\n- System health checks\n- Storage space monitoring\n- Camera input verification\n- Performance monitoring\n\n2. Weekly maintenance:\n- Storage cleanup procedures\n- Software updates\n- Hardware inspection\n- Backup system testing\n\n3. Monthly maintenance:\n- Deep system analysis\n- Performance optimization\n- Hardware calibration\n- Documentation updates\n\n4. Preventive measures:\n- Regular software updates\n- Hardware replacement schedules\n- Environmental monitoring\n- Training refreshers',
        tags: ['maintenance', 'optimization', 'monitoring', 'preventive']
      }
    ]
  },
  {
    id: 'xt3',
    title: 'XT3',
    description: 'Advanced replay server for high-end sports production',
    icon: 'server',
    status: 'online',
    wisdomBlocks: [
      {
        id: 'xt3-capabilities',
        title: 'System Capabilities',
        description: 'Understanding XT3 advanced capabilities',
        content: 'XT3 system capabilities overview:\n\n1. Recording capabilities:\n- Multi-format support\n- High frame rate recording\n- Multiple codec support\n- Synchronized recording\n\n2. Playback features:\n- Variable speed playback\n- Multi-angle playback\n- Effects and transitions\n- Real-time color correction\n\n3. Storage systems:\n- High-speed storage\n- Redundant systems\n- Cloud integration\n- Archive management\n\n4. Network features:\n- High-bandwidth support\n- Remote access\n- Content sharing\n- Streaming capabilities',
        tags: ['capabilities', 'recording', 'playback', 'storage']
      },
      {
        id: 'xt3-workflows',
        title: 'Production Workflows',
        description: 'Optimized workflows for XT3 systems',
        content: 'XT3 production workflow optimization:\n\n1. Live sports production:\n- Multi-camera setup\n- Real-time analysis\n- Instant replay creation\n- Highlight generation\n\n2. Post-production workflows:\n- Content logging\n- Edit decision lists\n- Color grading\n- Audio post-production\n\n3. Distribution workflows:\n- Multi-platform delivery\n- Format conversion\n- Quality control\n- Metadata management\n\n4. Archive workflows:\n- Long-term storage\n- Content indexing\n- Search capabilities\n- Retrieval procedures',
        tags: ['workflows', 'production', 'distribution', 'archive']
      },
      {
        id: 'xt3-best-practices',
        title: 'Best Practices',
        description: 'Industry best practices for XT3 operations',
        content: 'XT3 best practices for optimal performance:\n\n1. System setup:\n- Proper hardware configuration\n- Network optimization\n- Storage configuration\n- User access management\n\n2. Operational procedures:\n- Pre-event preparation\n- Quality control checks\n- Backup procedures\n- Emergency protocols\n\n3. Content management:\n- Naming conventions\n- Metadata standards\n- Version control\n- Archive procedures\n\n4. Team coordination:\n- Role definitions\n- Communication protocols\n- Training requirements\n- Performance monitoring',
        tags: ['best-practices', 'setup', 'operations', 'management']
      }
    ]
  },
  {
    id: 'evs-lsm-legacy',
    title: 'EVS LSM LEGACY',
    description: 'Legacy live slow motion replay system for sports production',
    icon: 'video',
    status: 'online',
    wisdomBlocks: [
      {
        id: 'evs-lsm-legacy-basics',
        title: 'System Basics',
        description: 'Fundamental concepts and operations',
        content: 'EVS LSM Legacy system fundamentals:\n\n1. System architecture:\n- Hardware components overview\n- Software architecture\n- Network topology\n- Storage systems\n\n2. Basic operations:\n- Recording procedures\n- Playback controls\n- Clip management\n- Export functions\n\n3. User interface:\n- Control panel layout\n- Menu navigation\n- Keyboard shortcuts\n- Timeline controls\n\n4. File management:\n- Clip organization\n- Folder structures\n- Naming conventions\n- Archive procedures',
        tags: ['basics', 'architecture', 'operations', 'interface']
      },
      {
        id: 'evs-lsm-legacy-migration',
        title: 'Migration Guide',
        description: 'Migrating from legacy systems to modern solutions',
        content: 'Migration from EVS LSM Legacy systems:\n\n1. Pre-migration planning:\n- Current system assessment\n- Migration timeline\n- Resource requirements\n- Risk assessment\n\n2. Data migration:\n- Content export procedures\n- Format conversion\n- Quality verification\n- Backup strategies\n\n3. System transition:\n- Parallel operation setup\n- User training\n- Workflow adaptation\n- Performance validation\n\n4. Post-migration:\n- System optimization\n- User support\n- Performance monitoring\n- Legacy system decommissioning',
        tags: ['migration', 'transition', 'planning', 'training']
      },
      {
        id: 'evs-lsm-legacy-support',
        title: 'Support & Maintenance',
        description: 'Ongoing support for legacy systems',
        content: 'EVS LSM Legacy support and maintenance:\n\n1. Regular maintenance:\n- System health checks\n- Software updates\n- Hardware inspections\n- Performance monitoring\n\n2. Troubleshooting:\n- Common issues and solutions\n- Diagnostic procedures\n- Emergency protocols\n- Contact procedures\n\n3. Parts and service:\n- Replacement parts availability\n- Service agreements\n- Upgrade options\n- End-of-life planning\n\n4. Documentation:\n- User manuals\n- Technical specifications\n- Service history\n- Knowledge base',
        tags: ['support', 'maintenance', 'troubleshooting', 'documentation']
      }
    ]
  },
  {
    id: 'xt-via',
    title: 'XT-VIA',
    description: 'Next-generation EVS XT server for live replay and ingest',
    icon: 'cpu',
    status: 'online',
    wisdomBlocks: [
      {
        id: 'xt-via-installation',
        title: 'Installation Guide',
        description: 'Step-by-step installation procedures',
        content: 'XT-VIA installation guide:\n\n1. Pre-installation requirements:\n- System specifications verification\n- Network infrastructure preparation\n- Storage system configuration\n- Software license preparation\n\n2. Hardware installation:\n- Server mounting and connections\n- I/O card installation\n- Network configuration\n- Power supply setup\n\n3. Software installation:\n- Operating system installation\n- XT-VIA software installation\n- License activation\n- Initial configuration\n\n4. Testing and validation:\n- System functionality tests\n- Performance benchmarks\n- Network connectivity tests\n- Backup system verification',
        tags: ['installation', 'setup', 'configuration', 'testing']
      },
      {
        id: 'xt-via-workflow',
        title: 'Production Workflow',
        description: 'Optimal workflows for XT-VIA in production',
        content: 'XT-VIA production workflow optimization:\n\n1. Content ingest:\n- Multi-format support\n- Real-time transcoding\n- Quality monitoring\n- Metadata management\n\n2. Live operations:\n- Multi-channel recording\n- Real-time replay creation\n- Effect processing\n- Output management\n\n3. Post-production integration:\n- Content export procedures\n- Format conversion\n- Archive management\n- Quality control\n\n4. Collaboration features:\n- Multi-user access\n- Version control\n- Approval workflows\n- Content sharing',
        tags: ['workflow', 'production', 'ingest', 'collaboration']
      },
      {
        id: 'xt-via-optimization',
        title: 'Performance Optimization',
        description: 'System optimization for maximum performance',
        content: 'XT-VIA performance optimization techniques:\n\n1. Storage optimization:\n- RAID configuration\n- Cache management\n- I/O optimization\n- Capacity planning\n\n2. Network optimization:\n- Bandwidth management\n- Quality of Service (QoS)\n- Load balancing\n- Redundancy setup\n\n3. CPU and memory optimization:\n- Process prioritization\n- Memory allocation\n- Thermal management\n- Resource monitoring\n\n4. Monitoring and maintenance:\n- Performance metrics\n- Alert systems\n- Preventive maintenance\n- Troubleshooting procedures',
        tags: ['optimization', 'performance', 'monitoring', 'maintenance']
      }
    ]
  },
  {
    id: 'evs-lsm-via',
    title: 'EVS LSM VIA',
    description: 'Advanced LSM replay system with VIA technology',
    icon: 'video',
    status: 'online',
    wisdomBlocks: [
      {
        id: 'evs-lsm-via-features',
        title: 'Advanced Features',
        description: 'Exploring VIA technology capabilities',
        content: 'EVS LSM VIA advanced features:\n\n1. VIA technology benefits:\n- Enhanced processing power\n- Improved video quality\n- Reduced latency\n- Better integration\n\n2. Advanced replay features:\n- Multi-angle synchronization\n- Super slow motion\n- Advanced effects\n- Real-time analysis\n\n3. Workflow enhancements:\n- Automated clip creation\n- Intelligent tagging\n- Content analysis\n- Cloud integration\n\n4. Remote capabilities:\n- Remote operation\n- Cloud-based workflows\n- Mobile access\n- Collaborative editing',
        tags: ['via', 'features', 'replay', 'remote']
      },
      {
        id: 'evs-lsm-via-integration',
        title: 'System Integration',
        description: 'Integrating VIA systems with existing workflows',
        content: 'EVS LSM VIA integration strategies:\n\n1. Workflow integration:\n- Existing system compatibility\n- Protocol support\n- Data exchange\n- User interface adaptation\n\n2. Technical integration:\n- Network configuration\n- API implementation\n- Custom connectors\n- Performance optimization\n\n3. Operational integration:\n- User training\n- Workflow adaptation\n- Quality control\n- Performance monitoring\n\n4. Future planning:\n- Scalability considerations\n- Upgrade paths\n- Technology roadmap\n- Investment planning',
        tags: ['integration', 'workflow', 'technical', 'planning']
      },
      {
        id: 'evs-lsm-via-training',
        title: 'Training Resources',
        description: 'Comprehensive training for VIA systems',
        content: 'EVS LSM VIA training programs:\n\n1. Basic training:\n- System overview\n- Basic operations\n- Safety procedures\n- Troubleshooting basics\n\n2. Advanced training:\n- Complex workflows\n- System optimization\n- Advanced features\n- Performance tuning\n\n3. Specialized training:\n- Sports-specific workflows\n- Live event operations\n- Emergency procedures\n- Maintenance training\n\n4. Certification programs:\n- Operator certification\n- Technical certification\n- Instructor certification\n- Continuing education',
        tags: ['training', 'certification', 'education', 'skills']
      }
    ]
  }
];

// Helper function to find a wisdom block by ID across all products
export function findWisdomBlock(blockId: string): WisdomBlock | undefined {
  for (const product of evsProducts) {
    const block = product.wisdomBlocks.find(b => b.id === blockId);
    if (block) return block;
  }
  return undefined;
}