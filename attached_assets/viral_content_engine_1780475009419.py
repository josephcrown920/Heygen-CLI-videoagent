#!/usr/bin/env python3
"""
Viral Content Engine — Seedance 2.0 + Kling
Generates 300+ hook variations + formatted video prompts for tech & music products.
"""

import json
import random
import argparse
from datetime import datetime
from typing import List, Dict

# ─── HOOK TEMPLATES BY ANGLE ───

HOOKS = {
    "curiosity": [
        "I wasn't expecting to love this {product} this much.",
        "This {product} hits different.",
        "If you get it, you get it.",
        "POV: you finally found the {product} that actually works.",
        "I tested 47 {product}s. This one broke the scale.",
        "Nobody talks about this {product} feature.",
        "The {product} you didn't know you needed.",
        "Wait... this {product} does WHAT?",
        "I thought it was overhyped until I tried it.",
        "Hidden gem {product} that deserves more hype.",
    ],
    "transformation": [
        "My {workflow} before vs after this {product}.",
        "This {product} changed how I {action} forever.",
        "From {bad_state} to {good_state} in {timeframe}.",
        "I used to {old_way}. Now I {new_way}.",
        "The glow-up your {setup} deserves.",
        "This is what {result} looks like.",
        "Level up your {category} game instantly.",
        "The upgrade that actually matters.",
    ],
    "social_proof": [
        "{number} people asked me about this {product} today.",
        "The {product} that broke the group chat.",
        "Every {expert} I know uses this.",
        "This {product} sold out {number} times.",
        "The reviews don't lie on this one.",
        "When {influencer} recommended this {product}...",
        "The {product} that went viral for a reason.",
    ],
    "pain_point": [
        "Tired of {problem}? This {product} fixes that.",
        "Stop wasting money on {bad_alternative}.",
        "The {product} that solved my {pain}.",
        "Finally, a {product} that doesn't {frustration}.",
        "No more {annoyance}. Just {benefit}.",
        "The end of {old_problem} is here.",
    ],
    "aspirational": [
        "This is the {product} your future self will thank you for.",
        "Invest in your {category}. Start here.",
        "The {product} that makes you look like you know what you're doing.",
        "Professional-grade {product} without the pro price.",
        "Your {setup} deserves better.",
        "This {product} just hits different at {time_of_day}.",
    ],
    "urgency": [
        "This {product} won't stay in stock.",
        "If you're seeing this, it's still available.",
        "Limited drop. No cap.",
        "Get it before the algorithm hides it again.",
        "The {product} that's selling out while you scroll.",
    ],
    "relatable": [
        "Me pretending I need another {product}...",
        "Adulting is hard. This {product} makes it easier.",
        "The {product} I bought at 2am and don't regret.",
        "When your {category} budget is $0 but you find this...",
        "Me showing up to {event} with this {product}.",
        "Just a {product} doing {product} things.",
    ],
    "feature_focus": [
        "The {feature} on this {product} is everything.",
        "Back detail is everything. (Yes, {product}s have back details.)",
        "So effortless. So {adjective}.",
        "The {feature} alone is worth it.",
        "This {feature} changed the game.",
        "Zero {negative}. All {positive}.",
    ],
}

# ─── PRODUCT-SPECIFIC VOCABULARIES ───

TECH_VOCAB = {
    "product": ["headset", "keyboard", "mouse", "monitor", "laptop stand", "USB hub", "webcam", "mic", "dock", "trackpad", "earbuds", "smartwatch", "power bank", "ring light", "capture card"],
    "workflow": ["setup", "desk setup", "WFH setup", "gaming rig", "streaming setup", "editing bay", "coding station"],
    "action": ["work", "game", "stream", "edit", "code", "create", "focus"],
    "bad_state": ["cluttered desk", "laggy setup", "cable hell", "wrist pain", "eye strain", "bad audio"],
    "good_state": ["clean desk", "zero lag", "cable-free", "ergonomic bliss", "perfect audio"],
    "timeframe": ["one week", "3 days", "a session", "one setup"],
    "old_way": ["used wired everything", "had cable spaghetti", "struggled with bad audio", "worked on a laptop flat"],
    "new_way": ["go wireless", "have a clean desk", "sound like a pro", "work ergonomically"],
    "setup": ["desk", "workspace", "battlestation", "rig"],
    "result": ["productivity", "clean setup", "pro audio", "zero cables"],
    "category": ["tech", "setup", "workspace", "gear"],
    "number": ["12", "8", "5", "20+"],
    "expert": ["streamer", "editor", "developer", "designer", "gamer"],
    "influencer": ["that one YouTuber", "your favorite tech reviewer", "the setup guy"],
    "problem": ["cable clutter", "bad audio", "wrist pain", "slow workflow", "messy desk"],
    "bad_alternative": ["cheap knockoffs", "overpriced brands", "basic gear"],
    "pain": ["wrist pain", "audio issues", "cable management", "slow workflow"],
    "frustration": ["break after 3 months", "lag", "die mid-stream", "look cheap"],
    "annoyance": ["charging cables", "background noise", "desk clutter", "setup time"],
    "benefit": ["wireless freedom", "studio sound", "clean aesthetic", "instant setup"],
    "old_problem": ["cable hell", "bad ergonomics", "amateur audio"],
    "time_of_day": ["midnight", "5am", "your 9-5", "grind hours"],
    "event": ["the meeting", "the stream", "the coffee shop", "the LAN party"],
    "feature": ["battery life", "latency", "build quality", "RGB", "wireless range", "noise canceling"],
    "adjective": ["clean", "smooth", "crisp", "premium", "tight"],
    "negative": ["lag", "noise", "clutter", "friction"],
    "positive": ["flow", "silence", "space", "speed"],
}

MUSIC_VOCAB = {
    "product": ["synth", "pedal", "interface", "headphones", "midi controller", "sample pack", "plugin", "drum machine", "looper", "mixer", "monitor", "mic", "cable", "stand", "DAW"],
    "workflow": ["production", "mixing", "beatmaking", "sound design", "live set", "recording session"],
    "action": ["produce", "mix", "perform", "create", "jam", "design sounds"],
    "bad_state": ["flat mixes", "boring beats", "cluttered project", "inspiration block", "thin sound"],
    "good_state": ["rich mixes", "fire beats", "organized sessions", "endless ideas", "full sound"],
    "timeframe": ["one session", "a weekend", "one track", "the first try"],
    "old_way": ["used stock sounds", "mixed in headphones", "programmed everything", "worked in the box"],
    "new_way": ["use analog warmth", "mix on monitors", "play it live", "go hybrid"],
    "setup": ["studio", "bedroom studio", "live rig", "production desk"],
    "result": ["that sound", "the vibe", "professional mixes", "inspiration"],
    "category": ["music", "production", "gear", "studio"],
    "number": ["30", "15", "100+", "50"],
    "expert": ["producer", "engineer", "DJ", "sound designer", "composer"],
    "influencer": ["that producer on TikTok", "your favorite beatmaker", "the mixing guy"],
    "problem": ["thin mixes", "boring sounds", "latency", "cluttered workflow"],
    "bad_alternative": ["pirate plugins", "cheap gear", "stock presets"],
    "pain": ["writer's block", "bad monitoring", "CPU overload", "inspiration drought"],
    "frustration": ["crash mid-session", "sound digital", "lack character"],
    "annoyance": ["latency", "CPU spikes", "cable noise", "setup time"],
    "benefit": ["zero latency", "analog warmth", "infinite inspiration", "pro sound"],
    "old_problem": ["digital coldness", "bad monitoring", "limited sounds"],
    "time_of_day": ["3am", "golden hour", "the late night session", "studio time"],
    "event": ["the gig", "the session", "the cypher", "the studio"],
    "feature": ["filter sweep", "saturation", "compression", "sequencer", "analog circuit", "presets"],
    "adjective": ["warm", "punchy", "wide", "deep", "crispy"],
    "negative": ["mud", "harshness", "flatness", "digital sheen"],
    "positive": ["warmth", "punch", "width", "depth", "character"],
}

# ─── VIDEO PROMPT TEMPLATES ───

SEEDANCE_PROMPTS = {
    "tech": [
        "A sleek {product} on a minimalist desk, soft natural light from window, cinematic slow pan, clean aesthetic, product showcase, 4K, photorealistic",
        "Close-up of hands using {product}, shallow depth of field, warm desk lamp lighting, macro detail shot, premium feel, 4K",
        "Overhead shot of {product} on organized desk, flat lay style, clean lines, neutral tones, tech aesthetic, 4K",
        "Person typing on {product} at golden hour, silhouette with backlight, cinematic mood, productivity vibe, 4K",
        "{product} unboxing, hands removing from packaging, soft box lighting, satisfying peel sounds implied, premium unboxing, 4K",
        "Before/after desk transformation with {product}, split screen, clean vs cluttered, satisfying organization, 4K",
        "POV shot using {product}, first-person perspective, screen glow on face, immersive experience, 4K",
        "{product} detail shot, rotating slowly on white background, studio lighting, product photography style, 4K",
        "Night desk setup with {product}, RGB ambient lighting, dark moody aesthetic, gamer/streamer vibe, 4K",
        "{product} in use during video call, professional home office, natural window light, remote work aesthetic, 4K",
    ],
    "music": [
        "Hands playing {product} in dim studio, warm tungsten lighting, intimate close-up, creative process, 4K, film grain",
        "{product} on vintage desk surrounded by gear, overhead shot, organized chaos, producer aesthetic, 4K",
        "Close-up of {product} knobs being turned, shallow depth of field, moody blue lighting, tactile detail, 4K",
        "Person producing with {product} at 3am, laptop glow, dark room, creative solitude, cinematic, 4K",
        "{product} in professional studio, rack focus between gear, clean signal chain, pro audio aesthetic, 4K",
        "Live performance with {product}, stage lights, crowd energy, dynamic movement, concert feel, 4K",
        "{product} unboxing in studio, excited energy, gear acquisition syndrome, satisfying reveal, 4K",
        "Time-lapse of beatmaking with {product}, hands moving fast, creative flow state, energetic, 4K",
        "{product} detail macro shot, circuit boards, analog warmth visible, technical beauty, 4K",
        "Split screen: {product} in bedroom studio vs pro studio, aspirational progression, motivational, 4K",
    ],
}

KLING_PROMPTS = {
    "tech": [
        "A person using {product} at their desk, smooth camera movement, natural lighting, lifestyle tech video, realistic, high quality",
        "Unboxing {product}, excited reaction, bright modern room, authentic feel, social media style, high quality",
        "Desk tour featuring {product}, walkthrough style, clean aesthetic, influencer video format, realistic",
        "Comparison: old gear vs {product}, side by side, honest review style, natural lighting, high quality",
        "{product} setup tutorial, step by step, helpful energy, home office background, realistic, clear",
        "Daily routine with {product}, morning to night montage, lifestyle integration, smooth transitions, high quality",
        "{product} stress test, intense usage, dramatic lighting, durability showcase, cinematic but realistic",
        "Gift opening {product}, genuine surprise, living room setting, authentic reaction, social media style",
        "Travel with {product}, packing into bag, on-the-go lifestyle, portable showcase, realistic, high quality",
        "{product} in coffee shop, remote work scene, ambient background, productivity aesthetic, realistic",
    ],
    "music": [
        "Producer using {product} in home studio, vlog style, authentic creative process, natural lighting, realistic",
        "{product} sound demo, fingers on controls, reaction to sound, studio environment, high quality audio visual",
        "Beatmaking session with {product}, energetic movement, creative flow, bedroom studio, realistic, raw",
        "{product} review, honest opinions, gear talk, studio background, influencer style, authentic",
        "Live jam with {product}, spontaneous performance, intimate venue, crowd reaction, realistic, energetic",
        "{product} tutorial, educational tone, screen recording mix, helpful guidance, clear, high quality",
        "Studio session with {product}, collaborative energy, multiple producers, creative discussion, realistic",
        "{product} in action at gig, stage perspective, dynamic lighting, performance energy, high quality",
        "Sampling with {product}, found sounds, creative process, urban exploration, artistic, realistic",
        "{product} collection showcase, gear nerd energy, organized display, proud owner, authentic, high quality",
    ],
}

# ─── CORE ENGINE ───

class ContentEngine:
    def __init__(self, niche: str, product: str, count: int = 300):
        self.niche = niche.lower()
        self.product = product
        self.count = count
        self.vocab = TECH_VOCAB if niche.lower() == "tech" else MUSIC_VOCAB
        self.hooks = []
        self.prompts = []

    def _fill_template(self, template: str) -> str:
        """Replace placeholders with random vocabulary."""
        result = template
        # Find all {word} placeholders
        import re
        placeholders = re.findall(r'\{([^}]+)\}', template)
        for ph in placeholders:
            if ph in self.vocab:
                replacement = random.choice(self.vocab[ph])
                result = result.replace(f"{{{ph}}}", replacement)
            elif ph == "product":
                result = result.replace(f"{{{ph}}}", self.product)
        return result

    def generate_hooks(self) -> List[Dict]:
        """Generate hook variations with metadata."""
        hooks = []
        angle_keys = list(HOOKS.keys())

        while len(hooks) < self.count:
            angle = random.choice(angle_keys)
            template = random.choice(HOOKS[angle])
            text = self._fill_template(template)

            # Ensure uniqueness
            if text not in [h["text"] for h in hooks]:
                hooks.append({
                    "id": f"H{len(hooks)+1:03d}",
                    "angle": angle,
                    "text": text,
                    "cta": random.choice([
                        "Link in bio 🔗",
                        "Grab yours before it sells out 👇",
                        "This is the one 🛒",
                        "You need this ⚡",
                        "Trust me on this one 👇",
                        "Game changer 🚀",
                    ]),
                    "hashtags": self._generate_hashtags(angle),
                })

        self.hooks = hooks
        return hooks

    def _generate_hashtags(self, angle: str) -> str:
        base = ["#viral", "#fyp", "#musthave"]
        if self.niche == "tech":
            base.extend(["#tech", "#setup", "#desksetup", "#gadget", "#techtok"])
        else:
            base.extend(["#music", "#producer", "#beatmaker", "#studio", "#musictok"])

        angle_tags = {
            "curiosity": ["#curious", "#discover", "#hidden"],
            "transformation": ["#glowup", "#beforeandafter", "#upgrade"],
            "social_proof": ["#trending", "#viral", "#soldout"],
            "pain_point": ["#problem", "#solution", "#finally"],
            "aspirational": ["#goals", "#invest", "#future"],
            "urgency": ["#limited", "#hurry", "#now"],
            "relatable": ["#relatable", "#mood", "#real"],
            "feature_focus": ["#details", "#quality", "#premium"],
        }
        base.extend(angle_tags.get(angle, []))
        return " ".join(random.sample(base, min(5, len(base))))

    def generate_prompts(self) -> List[Dict]:
        """Generate video prompts for Seedance and Kling."""
        prompts = []

        # Seedance prompts
        sd_templates = SEEDANCE_PROMPTS[self.niche]
        for i, template in enumerate(sd_templates):
            for variant in range(3):  # 3 variations per template
                prompt_text = template.replace("{product}", self.product)
                prompts.append({
                    "id": f"SD{len(prompts)+1:03d}",
                    "platform": "Seedance 2.0",
                    "style": "cinematic" if i < 5 else "lifestyle",
                    "prompt": prompt_text + f", variation {variant+1}",
                    "duration": random.choice(["5s", "10s", "15s"]),
                    "aspect_ratio": "9:16",
                })

        # Kling prompts
        kl_templates = KLING_PROMPTS[self.niche]
        for i, template in enumerate(kl_templates):
            for variant in range(3):
                prompt_text = template.replace("{product}", self.product)
                prompts.append({
                    "id": f"KL{len(prompts)+1:03d}",
                    "platform": "Kling",
                    "style": "authentic" if i < 5 else "dynamic",
                    "prompt": prompt_text + f", variation {variant+1}",
                    "duration": random.choice(["5s", "10s", "15s"]),
                    "aspect_ratio": "9:16",
                })

        self.prompts = prompts
        return prompts

    def generate_campaign(self) -> Dict:
        """Generate full campaign package."""
        hooks = self.generate_hooks()
        prompts = self.generate_prompts()

        # Pair hooks with prompts for ready-to-run clips
        clips = []
        for i, hook in enumerate(hooks[:60]):  # Top 60 get video prompts
            prompt = prompts[i % len(prompts)]
            clips.append({
                "clip_id": f"CLIP{i+1:03d}",
                "hook": hook["text"],
                "cta": hook["cta"],
                "hashtags": hook["hashtags"],
                "video_prompt": prompt["prompt"],
                "platform": prompt["platform"],
                "duration": prompt["duration"],
                "angle": hook["angle"],
            })

        return {
            "meta": {
                "generated_at": datetime.now().isoformat(),
                "niche": self.niche,
                "product": self.product,
                "total_hooks": len(hooks),
                "total_prompts": len(prompts),
                "ready_clips": len(clips),
            },
            "hooks": hooks,
            "video_prompts": prompts,
            "ready_to_run_clips": clips,
            "strategy": {
                "posting_schedule": "3-5 clips per day, spaced 3-4 hours apart",
                "testing_phase": "Days 1-3: Test all 8 angles equally",
                "scaling_phase": "Days 4-7: Double down on top 2 angles",
                "killing_criteria": "Kill clips with <3% engagement after 2 hours",
                "pushing_criteria": "Push clips with >8% engagement with paid boost",
            }
        }

    def export_json(self, filepath: str = None):
        """Export campaign to JSON."""
        campaign = self.generate_campaign()
        if filepath is None:
            filepath = f"campaign_{self.niche}_{self.product.replace(' ', '_')}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(campaign, f, indent=2, ensure_ascii=False)
        print(f"✅ Campaign exported to: {filepath}")
        return filepath

    def export_csv(self, filepath: str = None):
        """Export hooks to CSV for spreadsheet tracking."""
        import csv
        if filepath is None:
            filepath = f"hooks_{self.niche}_{self.product.replace(' ', '_')}.csv"

        hooks = self.generate_hooks()
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["id", "angle", "text", "cta", "hashtags", "status", "views", "engagement"])
            writer.writeheader()
            for h in hooks:
                row = h.copy()
                row["status"] = "ready"
                row["views"] = ""
                row["engagement"] = ""
                writer.writerow(row)
        print(f"✅ Hooks CSV exported to: {filepath}")
        return filepath

    def print_sample(self, n: int = 10):
        """Print sample hooks and prompts."""
        campaign = self.generate_campaign()
        print("\n" + "="*60)
        print(f"🚀 VIRAL CONTENT ENGINE — {self.niche.upper()} | {self.product.upper()}")
        print("="*60)

        print(f"\n📊 STATS:")
        print(f"   Total Hooks: {campaign['meta']['total_hooks']}")
        print(f"   Video Prompts: {campaign['meta']['total_prompts']}")
        print(f"   Ready-to-Run Clips: {campaign['meta']['ready_clips']}")

        print(f"\n🎯 TOP {n} HOOKS:")
        for hook in campaign['hooks'][:n]:
            print(f"\n   [{hook['angle'].upper()}] {hook['text']}")
            print(f"   CTA: {hook['cta']}")
            print(f"   Tags: {hook['hashtags']}")

        print(f"\n🎬 SAMPLE VIDEO PROMPTS:")
        for prompt in campaign['video_prompts'][:4]:
            print(f"\n   [{prompt['platform']}] {prompt['style']}")
            print(f"   {prompt['prompt'][:100]}...")

        print(f"\n📅 STRATEGY:")
        for k, v in campaign['strategy'].items():
            print(f"   {k}: {v}")
        print("\n" + "="*60)


# ─── CLI ───

def main():
    parser = argparse.ArgumentParser(description="Viral Content Engine for Seedance 2.0 + Kling")
    parser.add_argument("niche", choices=["tech", "music"], help="Product niche")
    parser.add_argument("product", help="Product name (e.g., 'mechanical keyboard', 'analog synth')")
    parser.add_argument("-n", "--count", type=int, default=300, help="Number of hooks to generate (default: 300)")
    parser.add_argument("-o", "--output", choices=["json", "csv", "both"], default="both", help="Output format")
    parser.add_argument("--sample", action="store_true", help="Print sample instead of exporting")

    args = parser.parse_args()

    engine = ContentEngine(niche=args.niche, product=args.product, count=args.count)

    if args.sample:
        engine.print_sample(n=10)
    else:
        if args.output in ("json", "both"):
            engine.export_json()
        if args.output in ("csv", "both"):
            engine.export_csv()
        engine.print_sample(n=5)

if __name__ == "__main__":
    main()
