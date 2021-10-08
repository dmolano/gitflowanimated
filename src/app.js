import React, { Component } from "react";
import styled from "styled-components";
import GitFlow from "./gitflow";
import { SemVer } from "semver";

const DEVELOP = "develop";
const MASTER = "master";

const masterID = 0;
const developID = 1;
const firstMasterCommitID = 2;
const firstDevelopCommitID = 3;
const firstFreeCommitID = 4;

const seedData = () => {
  const commits = [
    {
      id: firstMasterCommitID,
      branch: masterID,
      semver: new SemVer("0.0.0"),
      gridIndex: 1,
      parents: null,
    },
    {
      id: firstDevelopCommitID,
      branch: developID,
      gridIndex: 1,
      parents: null,
    },
  ];
  return {
    branches: [
      {
        name: MASTER,
        id: masterID,
        canCommit: false,
        color: "#E040FB",
      },
      {
        name: DEVELOP,
        id: developID,
        canCommit: true,
        color: "#FF8A65",
      },
    ],
    commits,
  };
};

const AppElm = styled.main`
  text-align: center;
  padding: 10px;
`;

class App extends Component {
  shortid_generate = firstFreeCommitID;
  lastFeatureNumber = 1;

  state = {
    project: seedData(),
  };

  handleCommit = (branchID, mergeGridIndex = 0) => {
    let { branches, commits } = this.state.project;
    const branchCommits = commits.filter((c) => c.branch === branchID);
    const lastCommit = branchCommits[branchCommits.length - 1];
    commits.push({
      id: this.shortid_generate++,
      branch: branchID,
      gridIndex: lastCommit.gridIndex + mergeGridIndex + 1,
      parents: [lastCommit.id],
    });
    if (branchID === developID) {
      let ltFeatureBranches = branches.filter(
        (b) => b.ltFeatureBranch || b.merged === false
      );
      ltFeatureBranches.forEach((b) => {
        document.getElementById(
          "updateButtonIcon" + b.id + "FeatureBranchId"
        ).disabled = false;
      });
    }
    this.setState({
      commits,
    });
  };

  handleTag = (sourceBranchID, mergeGridIndex = 0) => {
    let { branches, commits } = this.state.project;
    const sourceBranchCommits = commits.filter(
      (c) => c.branch === sourceBranchID
    );
    const lastCommit = sourceBranchCommits[sourceBranchCommits.length - 1];
    const sourceBranch = branches.find((b) => b.id === sourceBranchID);
    let nextSemVer = new SemVer(sourceBranch.lastTag.toString()).inc("patch");

    sourceBranch.lastTag = nextSemVer;
    commits.push({
      id: this.shortid_generate++,
      branch: sourceBranchID,
      gridIndex: lastCommit.gridIndex + mergeGridIndex + 1,
      parents: [lastCommit.id],
      tag: nextSemVer.toString(),
      semver: nextSemVer,
      color: "#E040FB",
    });
    this.setState({
      commits,
    });
  };

  handleNewLongTermFeature = () => {
    let { branches, commits } = this.state.project;
    let developCommits = commits.filter((c) => c.branch === developID);
    const lastDevelopCommit = developCommits[developCommits.length - 1];
    let featureOffset = lastDevelopCommit.gridIndex + 1;
    let featureNameInput = document.getElementById("featureNameId");
    let featureBranchName;

    if (featureNameInput.value.length > 0) {
      featureBranchName = "ltfeature " + featureNameInput.value;
    } else {
      featureBranchName =
        "ltfeature " +
        "rm" +
        (this.lastFeatureNumber++).toString().padStart(2, "0");
    }
    let newBranch = {
      id: this.shortid_generate++,
      name: featureBranchName,
      ltFeatureBranch: true,
      canCommit: true,
      color: "#64B5F6",
    };
    let newCommit = {
      id: this.shortid_generate++,
      branch: newBranch.id,
      gridIndex: featureOffset,
      parents: [lastDevelopCommit.id],
    };
    commits.push(newCommit);
    branches.push(newBranch);
    this.setState({
      project: {
        branches,
        commits,
      },
    });
    document.getElementById("featureNameId").value = "";
  };

  handleNewShortTermFeature = () => {
    let { branches, commits } = this.state.project;
    let developCommits = commits.filter((c) => c.branch === developID);
    const lastDevelopCommit = developCommits[developCommits.length - 1];
    let featureOffset = lastDevelopCommit.gridIndex + 1;
    let featureNameInput = document.getElementById("featureNameId");
    let featureBranchName;

    if (featureNameInput.value.length > 0) {
      featureBranchName = "stfeature " + featureNameInput.value;
    } else {
      featureBranchName =
        "stfeature " +
        "rm" +
        (this.lastFeatureNumber++).toString().padStart(2, "0");
    }
    let newBranch = {
      id: this.shortid_generate++,
      name: featureBranchName,
      stFeatureBranch: true,
      canCommit: true,
      color: "#64B5F6",
    };
    let newCommit = {
      id: this.shortid_generate++,
      branch: newBranch.id,
      gridIndex: featureOffset,
      parents: [lastDevelopCommit.id],
    };
    commits.push(newCommit);
    branches.push(newBranch);
    this.setState({
      project: {
        branches,
        commits,
      },
    });
    document.getElementById("featureNameId").value = "";
  };

  handleNewHotFix = () => {
    let { branches, commits } = this.state.project;
    let hotfixNameInput = document.getElementById("hotfixNameId");
    let masterCommits = commits.filter((c) => c.branch === masterID);
    const lastMasterCommit = masterCommits[masterCommits.length - 1];
    let hotFixOffset = lastMasterCommit.gridIndex + 1;
    let newSemVer;

    if (hotfixNameInput.value.length > 0) {
      newSemVer = new SemVer(hotfixNameInput.value);
    }
    if (newSemVer === undefined || newSemVer === null) {
      newSemVer = new SemVer(lastMasterCommit.semver.toString()).inc("patch");
    } else {
      newSemVer = new SemVer(hotfixNameInput.value);
    }
    let hotFixBranchName = "hot " + newSemVer;

    let newBranch = {
      id: this.shortid_generate++,
      name: hotFixBranchName,
      semver: newSemVer,
      hotFixBranch: true,
      canCommit: true,
      color: "#ff1744",
    };
    let newCommit = {
      id: this.shortid_generate++,
      branch: newBranch.id,
      gridIndex: hotFixOffset,
      parents: [lastMasterCommit.id],
    };
    commits.push(newCommit);
    branches.push(newBranch);
    this.setState({
      project: {
        branches,
        commits,
      },
    });
  };

  handleNewSupport = () => {
    let { branches, commits } = this.state.project;
    let supportNameInput = document.getElementById("supportNameId");
    let masterCommits = commits.filter((c) => c.branch === masterID);
    const lastMasterCommit = masterCommits[masterCommits.length - 1];
    let supportOffset = lastMasterCommit.gridIndex + 1;
    let newSemVer;

    if (supportNameInput.value.length > 0) {
      newSemVer = new SemVer(supportNameInput.value);
    }
    if (newSemVer === undefined || newSemVer === null) {
      newSemVer = new SemVer(lastMasterCommit.semver.toString());
    } else {
      newSemVer = new SemVer(supportNameInput.value);
    }
    let supportBranchName = "sup " + newSemVer;
    let newBranch = {
      id: this.shortid_generate++,
      name: supportBranchName + "+",
      semver: newSemVer,
      supportBranch: true,
      canCommit: true,
      lastTag: newSemVer,
      color: "#E3FF32",
    };
    let newCommit = {
      id: this.shortid_generate++,
      branch: newBranch.id,
      gridIndex: supportOffset,
      parents: [lastMasterCommit.id],
    };
    commits.push(newCommit);
    branches.push(newBranch);
    this.setState({
      project: {
        branches,
        commits,
      },
    });
  };

  handleNewMajorRelease = () => {
    this.handleNewRelease("major");
  };

  handleNewMinorRelease = () => {
    this.handleNewRelease("minor");
  };

  handleNewRelease = (releaseType) => {
    let { branches, commits } = this.state.project;
    let releaseNameInput = document.getElementById("releaseNameId");
    let developCommits = commits.filter((c) => c.branch === developID);
    let masterCommits = commits.filter((c) => c.branch === masterID);
    const lastDevelopCommit = developCommits[developCommits.length - 1];
    const lastMasterCommit = masterCommits[masterCommits.length - 1];
    let releaseOffset = lastDevelopCommit.gridIndex + 1;
    let newSemVer;

    if (releaseNameInput.value.length > 0) {
      newSemVer = new SemVer(releaseNameInput.value);
    }
    if (newSemVer === undefined || newSemVer === null) {
      newSemVer = new SemVer(lastMasterCommit.semver.toString()).inc(
        releaseType
      );
    } else {
      newSemVer = new SemVer(releaseNameInput.value);
    }
    let releaseBranchName = "release " + newSemVer;

    let newBranch = {
      id: this.shortid_generate++,
      name: releaseBranchName,
      semver: newSemVer,
      releaseBranch: true,
      canCommit: true,
      color: "#B2FF59",
      releaseType: releaseType,
    };
    let newCommit = {
      id: this.shortid_generate++,
      branch: newBranch.id,
      gridIndex: releaseOffset,
      parents: [lastDevelopCommit.id],
    };
    commits.push(newCommit);
    branches.push(newBranch);
    this.setState({
      project: {
        branches,
        commits,
      },
    });
    document.getElementById("supportNameId").value = "";
    document.getElementById("releaseNameId").value = "";
  };

  handleRelease = (sourceBranchID) => {
    let { branches, commits } = this.state.project;
    const sourceBranch = branches.find((b) => b.id === sourceBranchID);
    if (sourceBranch.releaseType === "major") {
      this.handleNewSupport();
    }
    const sourceCommits = commits.filter((c) => c.branch === sourceBranchID);

    const masterCommits = commits.filter((c) => c.branch === masterID);
    const developCommits = commits.filter((c) => c.branch === developID);
    const lastSourceCommit = sourceCommits[sourceCommits.length - 1];
    const lastMasterCommit = masterCommits[masterCommits.length - 1];
    const lastDevelopCommit = developCommits[developCommits.length - 1];

    const masterMergeCommit = {
      id: this.shortid_generate++,
      branch: masterID,
      gridIndex:
        Math.max(lastSourceCommit.gridIndex, lastMasterCommit.gridIndex) + 1,
      parents: [lastMasterCommit.id, lastSourceCommit.id],
      semver: new SemVer(sourceBranch.semver.toString()),
    };

    const developMergeCommit = {
      id: this.shortid_generate++,
      branch: developID,
      gridIndex:
        Math.max(lastSourceCommit.gridIndex, lastDevelopCommit.gridIndex) + 1,
      parents: [lastDevelopCommit.id, lastSourceCommit.id],
    };

    commits.push(masterMergeCommit, developMergeCommit);
    sourceBranch.merged = true;

    let ltFeatureBranches = branches.filter(
      (b) => b.ltFeatureBranch || b.merged === false
    );
    ltFeatureBranches.forEach((b) => {
      document.getElementById(
        "updateButtonIcon" + b.id + "FeatureBranchId"
      ).disabled = false;
    });
    this.setState({
      project: {
        branches,
        commits,
      },
    });
    document.getElementById("hotfixNameId").value = "";
    document.getElementById("supportNameId").value = "";
  };

  handleMerge = (sourceBranchID, targetBranchID = developID) => {
    let { branches, commits } = this.state.project;

    const sourceBranch = branches.find((b) => b.id === sourceBranchID);
    const sourceCommits = commits.filter((c) => c.branch === sourceBranchID);
    const targetCommits = commits.filter((c) => c.branch === targetBranchID);

    const lastSourceCommit = sourceCommits[sourceCommits.length - 1];
    const lastTargetCommit = targetCommits[targetCommits.length - 1];

    const mergeCommit = {
      id: this.shortid_generate++,
      branch: targetBranchID,
      gridIndex:
        Math.max(lastSourceCommit.gridIndex, lastTargetCommit.gridIndex) + 1,
      parents: [lastSourceCommit.id, lastTargetCommit.id],
      tag: targetBranchID === 0 ? sourceBranch.name : null,
    };
    commits.push(mergeCommit);

    sourceBranch.merged = true;

    if (targetBranchID === developID) {
      let ltFeatureBranches = branches.filter(
        (b) => b.ltFeatureBranch || b.merged === false
      );
      ltFeatureBranches.forEach((b) => {
        document.getElementById(
          "updateButtonIcon" + b.id + "FeatureBranchId"
        ).disabled = false;
      });
    }
    this.setState({
      project: {
        branches,
        commits,
      },
    });
  };

  handleUpdate = (targetBranchID, sourceBranchID = developID) => {
    let { branches, commits } = this.state.project;

    const sourceBranch = branches.find((b) => b.id === sourceBranchID);
    const sourceCommits = commits.filter((c) => c.branch === sourceBranchID);
    const targetCommits = commits.filter((c) => c.branch === targetBranchID);

    const lastSourceCommit = sourceCommits[sourceCommits.length - 1];
    const lastTargetCommit = targetCommits[targetCommits.length - 1];

    const updateCommit = {
      id: this.shortid_generate++,
      branch: targetBranchID,
      gridIndex:
        Math.max(lastSourceCommit.gridIndex, lastTargetCommit.gridIndex) + 1,
      parents: [lastSourceCommit.id, lastTargetCommit.id],
      tag: targetBranchID === 0 ? sourceBranch.name : null,
      update: lastTargetCommit.id,
    };
    commits.push(updateCommit);

    document.getElementById(
      "updateButtonIcon" + targetBranchID + "FeatureBranchId"
    ).disabled = true;

    this.setState({
      project: {
        branches,
        commits,
      },
    });
  };

  handleDeleteBranch = (branchID) => {
    let { branches, commits } = this.state.project;

    let commitsToDelete = commits.filter((c) => c.branch === branchID);
    let lastCommit = commitsToDelete[commitsToDelete.length - 1];
    commits = commits.map((commit) => {
      if (commit.parents) {
        commit.parents = commit.parents.filter((pID) => pID !== lastCommit.id);
      }
      return commit;
    });
    branches = branches.filter((b) => b.id !== branchID);
    commits = commits.filter((c) => c.branch !== branchID);
    this.setState({
      project: {
        branches,
        commits,
      },
    });
  };

  handleSetEnableDisableButtonHotfix = () => {
    //Reference the Button.
    var inputSubmit = document.getElementById("hotfixNameId");
    var btnSubmit = document.getElementById("hotfixButtonId");

    //Verify the TextBox value.
    if (inputSubmit.value.trim() !== "") {
      //Enable the TextBox when TextBox has value.
      btnSubmit.disabled = false;
    } else {
      //Disable the TextBox when TextBox is empty.
      btnSubmit.disabled = true;
    }
  };

  render() {
    return (
      <AppElm>
        <GitFlow
          project={this.state.project}
          onUpdate={this.handleUpdate}
          onMerge={this.handleMerge}
          onRelease={this.handleRelease}
          onCommit={this.handleCommit}
          onNewLongTermFeature={this.handleNewLongTermFeature}
          onNewShortTermFeature={this.handleNewShortTermFeature}
          onNewMajorRelease={this.handleNewMajorRelease}
          onNewMinorRelease={this.handleNewMinorRelease}
          onDeleteBranch={this.handleDeleteBranch}
          onNewHotFix={this.handleNewHotFix}
          onNewSupport={this.handleNewSupport}
          onTag={this.handleTag}
          onSetEnableDisableButton={this.handleSetEnableDisableButton}
        />
      </AppElm>
    );
  }
}

export default App;
