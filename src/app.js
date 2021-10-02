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
    let { commits } = this.state.project;
    const branchCommits = commits.filter((c) => c.branch === branchID);
    const lastCommit = branchCommits[branchCommits.length - 1];
    commits.push({
      id: this.shortid_generate++,
      branch: branchID,
      gridIndex: lastCommit.gridIndex + mergeGridIndex + 1,
      parents: [lastCommit.id],
    });
    this.setState({
      commits,
    });
  };

  handleNewFeature = () => {
    let { branches, commits } = this.state.project;
    let developCommits = commits.filter((c) => c.branch === developID);
    const lastDevelopCommit = developCommits[developCommits.length - 1];
    let featureOffset = lastDevelopCommit.gridIndex + 1;
    let featureNameInput = document.getElementById("featureNameId");
    let featureBranchName;

    if (featureNameInput.value.length > 0) {
      featureBranchName = "feature " + featureNameInput.value;
    } else {
      featureBranchName =
        "feature " +
        "rm" +
        (this.lastFeatureNumber++).toString().padStart(3, "0");
    }
    let newBranch = {
      id: this.shortid_generate++,
      name: featureBranchName,
      featureBranch: true,
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
      color: "#E4FF19",
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
    document.getElementById("supportNameId").value = newSemVer.toString();
    document.getElementById("releaseNameId").value = "";
  };

  handleRelease = (sourceBranchID) => {
    let { branches, commits } = this.state.project;
    const sourceBranch = branches.find((b) => b.id === sourceBranchID);
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

    this.setState({
      project: {
        branches,
        commits,
      },
    });
    document.getElementById("hotfixNameId").value = "";
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
          onMerge={this.handleMerge}
          onRelease={this.handleRelease}
          onCommit={this.handleCommit}
          onNewFeature={this.handleNewFeature}
          onNewMajorRelease={this.handleNewMajorRelease}
          onNewMinorRelease={this.handleNewMinorRelease}
          onDeleteBranch={this.handleDeleteBranch}
          onNewHotFix={this.handleNewHotFix}
          onNewSupport={this.handleNewSupport}
          onNewTagSupport={this.handleNewTagSupport}
          onSetEnableDisableButton={this.handleSetEnableDisableButton}
        />
      </AppElm>
    );
  }
}

export default App;
