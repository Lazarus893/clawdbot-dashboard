import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export const skillsRouter = Router();

interface Skill {
  name: string;
  description: string;
  location: 'workspace' | 'openclaw' | 'agents';
}

function extractSkillInfo(skillPath: string, locationType: Skill['location']): Skill | null {
  try {
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    
    if (!fs.existsSync(skillMdPath)) {
      return null;
    }
    
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    
    // Extract description from SKILL.md
    // Look for description: in frontmatter or first paragraph
    let description = '';
    
    const descMatch = content.match(/description:\s*(.+)/);
    if (descMatch) {
      description = descMatch[1].replace(/^["']|["']$/g, '').trim();
    } else {
      // Try to get first meaningful paragraph
      const paragraphs = content.split('\n\n').filter(p => !p.startsWith('#') && !p.startsWith('---'));
      if (paragraphs.length > 0) {
        description = paragraphs[0].replace(/^[#*-]\s*/, '').trim().slice(0, 150);
      }
    }
    
    const name = path.basename(skillPath);
    
    return {
      name,
      description: description || 'No description available',
      location: locationType
    };
    
  } catch (error) {
    console.error(`Error reading skill at ${skillPath}:`, error);
    return null;
  }
}

function scanSkillDirectory(dirPath: string, locationType: Skill['location']): Skill[] {
  const skills: Skill[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return skills;
  }
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(dirPath, entry.name);
        const skillInfo = extractSkillInfo(skillPath, locationType);
        
        if (skillInfo) {
          skills.push(skillInfo);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return skills;
}

skillsRouter.get('/', async (_req, res) => {
  try {
    const skills: Skill[] = [];
    
    // Workspace skills: ~/clawd/skills/
    const workspaceSkills = scanSkillDirectory(
      path.join(homedir(), 'clawd', 'skills'),
      'workspace'
    );
    skills.push(...workspaceSkills);
    
    // Global OpenClaw skills: ~/.openclaw/skills/
    const openclawSkills = scanSkillDirectory(
      path.join(homedir(), '.openclaw', 'skills'),
      'openclaw'
    );
    skills.push(...openclawSkills);
    
    // Agent skills: ~/.agents/skills/
    const agentSkills = scanSkillDirectory(
      path.join(homedir(), '.agents', 'skills'),
      'agents'
    );
    skills.push(...agentSkills);
    
    // Sort alphabetically
    skills.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({ skills, total: skills.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});
