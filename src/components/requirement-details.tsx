'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Item } from '@/lib/data';
import { requirementGuides } from '@/lib/requirement-guides';

export function RequirementDetails({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const guide = requirementGuides[item.id];
  if (!guide) return null;
  return (
    <div className="requirement-details">
      <button type="button" className="btn secondary requirement-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Hide details' : 'See more details'} <span aria-hidden="true">{open ? '⌃' : '⌄'}</span>
      </button>
      {open && <div className="requirement-guide">
        <div className="requirement-intro">
          <span className="requirement-eyebrow">QUICK GUIDE</span>
          <p>{guide.overview}</p>
          <div className="requirement-office"><span aria-hidden="true">▣</span><div><span className="requirement-label">Responsible office</span><strong>{guide.agency}</strong></div></div>
        </div>
        <div className="requirement-grid">
          <section className="requirement-panel" aria-label="What to prepare">
            <div className="requirement-panel-heading"><span className="requirement-panel-icon" aria-hidden="true">✓</span><h4>What to prepare</h4></div>
            <ul className="requirement-checklist">{guide.prepare.map(x => <li key={x}><span className="requirement-check" aria-hidden="true" /> <span>{x}</span></li>)}</ul>
          </section>
          <section className="requirement-panel" aria-label="What to do next">
            <div className="requirement-panel-heading"><span className="requirement-panel-icon" aria-hidden="true">→</span><h4>What to do next</h4></div>
            <ol className="requirement-steps">{guide.actions.map((x,i) => <li key={x}><span className="requirement-step-number">{i+1}</span><span>{x}</span></li>)}</ol>
          </section>
        </div>
        <div className="requirement-resources">
          <div><h4>Official resources</h4><p>Open the government website to confirm current requirements.</p></div>
          <div className="requirement-links">{guide.source.map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} <span aria-hidden="true">↗</span></a>)}</div>
        </div>
        <div className="requirement-footer"><Link href="/documents" className="btn secondary">View related documents <span aria-hidden="true">→</span></Link><p>Requirements can change. Always confirm with the responsible office.</p></div>
      </div>}
    </div>
  );
}
