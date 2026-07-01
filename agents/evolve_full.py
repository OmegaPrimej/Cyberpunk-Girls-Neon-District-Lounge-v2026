# agents/evolve_full.py
import os
import json
import tensorflow as tf
import subprocess
from pathlib import Path
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class NeonState(TypedDict):
    phase: str
    files_created: List[str]
    contracts: dict
    errors: List[str]

class EvolveOrchestrator:
    def __init__(self):
        self.root = Path.cwd()
        print("⚡ INITIALIZE LIVE HUB")

    def scaffold(self, state: NeonState) -> NeonState:
        print("[AGENT:SCAFFOLD] Writing full repo structure from README lore...")

        # 1. Folders
        dirs = ["src/world","src/console","src/characters","src/systems","src/ui",
                "public/models","public/video","public/audio","contracts",
                "scripts","ai_models","agents"]
        for d in dirs: (self.root / d).mkdir(parents=True, exist_ok=True)

        # 2. package.json with all systems
        pkg = {
          "name": "neon-district-lounge-v2026",
          "scripts": {
            "dev": "next dev", "build": "next build",
            "agent:train": "python ai_models/train_npcs.py",
            "agent:scene": "python src/systems/scene_agent.py"
          },
          "dependencies": {
            "next": "14.2.3", "react": "18.3.1", "three": "0.164.1",
            "@react-three/fiber": "8.16.1", "@react-three/drei": "9.105.6",
            "gsap": "3.12.5", "video.js": "8.17.3", "tone": "14.7.77",
            "ethers": "6.13.1", "zustand": "4.5.4", "xstate": "5.16.0"
          },
          "devDependencies": {"typescript": "5.4.5", "hardhat": "2.22.6"}
        }
        Path("package.json").write_text(json.dumps(pkg, indent=2))

        # 3. Generate core files from lore
        self.gen_file("src/world/NeonSign.ts", self.neon_sign_code())
        self.gen_file("src/systems/SceneManager.ts", self.scene_manager_code())
        self.gen_file("contracts/LoungePass.sol", self.contract_code())
        self.gen_file("ai_models/train_npcs.py", self.tf_train_code())
        self.gen_file("hardhat.config.js", self.hardhat_config())
        self.gen_file("scripts/deploy.js", self.deploy_script())
        self.gen_file(".env.example", "PRIVATE_KEY=\nSEPOLIA_RPC=\nVERCEL_TOKEN=\nPRIVY_APP_ID=\n")

        state["files_created"].extend(["NeonSign.ts", "SceneManager.ts", "LoungePass.sol"])
        return state

    def gen_file(self, path: str, content: str):
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)

    def neon_sign_code(self):
        return '''import * as THREE from 'three';
export class NeonSign {
  constructor(scene, opts) {
    this.material = new THREE.MeshBasicMaterial({color: opts.color, transparent: true});
    this.baseIntensity = 1.0;
  }
  update(time) {
    const pulse = Math.sin(time * 2) * 0.1 + 1.0;
    const flicker = Math.random() > 0.98? 0.3 : 1.0;
    this.material.opacity = this.baseIntensity * pulse * flicker;
  }
}'''

    def scene_manager_code(self):
        return '''import * as THREE from 'three';
import gsap from 'gsap';
export class SceneManager {
  state: 'APARTMENT'|'ELEVATOR'|'DISTRICT' = 'APARTMENT';
  triggerElevator() {
    this.state = 'ELEVATOR';
    gsap.to('#apartment', {opacity: 0, onComplete: () => this.bootDistrict()});
  }
  bootDistrict() { this.state = 'DISTRICT'; console.log('NEON DISTRICT ONLINE'); }
}'''

    def contract_code(self):
        return '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract LoungePass is ERC721 {
    uint256 public nextId;
    uint256 constant PRICE = 0.05 ether;
    constructor() ERC721("Neon District Pass", "NEON") {}
    function mint() external payable {
        require(msg.value >= PRICE);
        _safeMint(msg.sender, nextId++);
    }
}'''

    def tf_train_code(self):
        return '''import tensorflow as tf
import json
npcs = ["VANDAL","CIPHER","AERO"]
for name in npcs:
    model = tf.keras.Sequential([
        tf.keras.layers.Embedding(5000,64),
        tf.keras.layers.LSTM(128),
        tf.keras.layers.Dense(3, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
    model.save(f"ai_models/{name.lower()}.h5")
    print(f"[TF] {name} neural matrix compiled")'''

    def hardhat_config(self):
        return '''require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: "0.8.20",
  networks: { sepolia: { url: process.env.SEPOLIA_RPC, accounts: [process.env.PRIVATE_KEY] } }
};'''

    def deploy_script(self):
        return '''const hre = require("hardhat");
const fs = require("fs");
async function main() {
  const Contract = await hre.ethers.getContractFactory("LoungePass");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  fs.writeFileSync(".contract_address", addr);
  console.log("LoungePass deployed to:", addr);
}
main();'''

def build_graph():
    workflow = StateGraph(NeonState)
    orchestrator = EvolveOrchestrator()
    workflow.add_node("scaffold", orchestrator.scaffold)
    workflow.set_entry_point("scaffold")
    workflow.add_edge("scaffold", END)
    return workflow.compile()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", default="scaffold")
    args = parser.parse_args()

    app = build_graph()
    app.invoke({"phase": args.phase, "files_created": [], "contracts": {}, "errors": []})
    print("AGENT_SWARM // PHASE COMPLETE")
