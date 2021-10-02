import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { Button, ButtonIcon, fallDownAnimation, fadeIn } from "./global-styles";
import GoeyFilter from "./goey-filter";
import Connections from "./connections";

const GitFlowElm = styled.div`
  margin: 0 auto;
`;

const GlobalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 10px;
`;

const ProjectElm = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 110px 1fr;
  margin-top: 20px;
  background: linear-gradient(
    135deg,
    rgba(34, 52, 122, 1) 0%,
    rgba(23, 35, 82, 1) 100%
  );
  border-radius: 5px;
  box-shadow: 0 4px 10px #9d9d9d;
  overflow: auto;
`;

const GridColumn = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${(p) => `repeat(${p.count || 2}, 110px)`};
`;

const BranchHeader = styled.div`
  max-width: 110px;
  padding: 5px;
  text-align: center;
  background-color: #131d45;
  border-right: 1px solid #1b295f;
  color: #f0f0f0;
  z-index: 1;
  margin-bottom: 10px;
  animation: ${fadeIn} 0.5s ease-in;
`;

const BranchActions = styled.div`
  display: grid;
  grid-template-columns: ${(p) => `repeat(${p.count || 1}, 1fr)`};
  margin-top: 10px;
  justify-items: center;
  height: 24px;
`;

const BranchName = styled.h4`
  position: relative;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5pt;
  margin-top: 10px;
  opacity: 0.6;
`;

const Commits = styled.ol`
  position: relative;
  min-height: 800px;
  height: ${(p) => p.height || "500px"};
  filter: url("#goo");
  z-index: 40;
  border-right: 1px solid #1b295f;
  transition: opacity 0.5s;
`;

const Commit = styled.li`
  position: absolute;
  display: grid;
  align-items: center;
  justify-items: center;
  top: ${(p) => p.top * 45 + "px"};
  left: 50%;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  transform: translate(-50%, -45px);
  background-color: ${(p) => p.color || "#9d9d9d"};
  box-shadow: 0 0 20px #f0f0f0;
  border: 1px solid #fff;
  animation: ${fallDownAnimation} cubic-bezier(0.77, 0, 0.175, 1) 1s;
  animation-fill-mode: forwards;
  z-index: 40;
  transition: all 0.2s;
  &.merged {
    background-color: #fff;
    box-shadow: none;
    opacity: 0.5;
  }
  font-size: 0.6rem;
  letter-spacing: 1pt;
`;

const Tag = styled.p`
  color: #fff;
  font-size: 0.5rem;
  letter-spacing: 0pt;
`;
const ConnectionsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 30;
`;

class GitFlow extends Component {
  componentWillMount() {
    this.commitPositions = {};
  }

  componentDidMount() {
    this.connectCommits();
  }

  componentDidUpdate() {
    this.connectCommits();
  }

  cacheConnectionsContainer = (elm) => {
    this.connectionsContainer = elm;
  };

  storeCommitPosition = (id, offset = 0, commitElm) => {
    if (commitElm) {
      this.commitPositions[id] = {
        top: commitElm.offsetTop,
        left: offset * 110 + commitElm.offsetLeft,
      };
    }
  };

  connectCommits = () => {
    const { commits } = this.props.project;
    let paths = commits.map((commit) => {
      const { parents } = commit;
      const tgtPosition = this.commitPositions[commit.id];
      return (parents || []).map((p) => {
        return {
          srcCommitID: p,
          tgtCommitID: commit.id,
          src: this.commitPositions[p],
          tgt: tgtPosition,
        };
      });
    });
    paths = [].concat.apply([], paths);
    ReactDOM.render(<Connections paths={paths} />, this.connectionsContainer);
  };

  deleteBranch = (branchID) => {
    const { commits } = this.props.project;
    const commitsToDelete = commits
      .filter((c) => c.branch === branchID)
      .map((c) => c.id);
    commitsToDelete.forEach((c) => {
      delete this.commitPositions[c.id];
    });
    this.props.onDeleteBranch(branchID);
  };

  renderCommitButton = (branch) => {
    return (
      <ButtonIcon
        data-tip="Commit"
        onClick={this.props.onCommit.bind(this, branch.id, 0)}
      >
        C
      </ButtonIcon>
    );
  };

  renderDeleteButton = (branch) => {
    return (
      <BranchActions count={1}>
        <ButtonIcon
          data-tip="Delete"
          onClick={this.deleteBranch.bind(this, branch.id)}
        >
          ✕
        </ButtonIcon>
      </BranchActions>
    );
  };

  renderDevelopBranchHeader = (branch) => {
    return (
      <BranchHeader>
        <BranchName>{branch.name}</BranchName>
        <BranchActions count={4}>
          <ButtonIcon data-tip="Release" onClick={this.props.onNewMajorRelease}>
            R
          </ButtonIcon>
          <ButtonIcon data-tip="Release" onClick={this.props.onNewMinorRelease}>
            r
          </ButtonIcon>
          {this.renderCommitButton(branch)}
          <ButtonIcon data-tip="Feature" onClick={this.props.onNewFeature}>
            F
          </ButtonIcon>
        </BranchActions>
      </BranchHeader>
    );
  };

  renderFeatureBranchHeader = (branch) => {
    let actionsElm = null;
    if (branch.merged) {
      actionsElm = this.renderDeleteButton(branch);
    } else {
      actionsElm = (
        <BranchActions count={2}>
          <ButtonIcon
            data-tip="Merge"
            onClick={this.props.onMerge.bind(this, branch.id, undefined)}
          >
            M
          </ButtonIcon>
          {this.renderCommitButton(branch)}
        </BranchActions>
      );
    }
    return (
      <BranchHeader key={branch.id}>
        <BranchName>{branch.name}</BranchName>
        {actionsElm}
      </BranchHeader>
    );
  };

  renderReleaseBranchHeader = (branch) => {
    let actionsElm = null;
    if (branch.merged) {
      actionsElm = this.renderDeleteButton(branch);
    } else {
      actionsElm = (
        <BranchActions count={2}>
          {this.renderCommitButton(branch)}
          <ButtonIcon
            data-tip="Merge"
            onClick={this.props.onRelease.bind(this, branch.id, undefined)}
          >
            M
          </ButtonIcon>
        </BranchActions>
      );
    }
    return (
      <BranchHeader key={branch.id}>
        <BranchName>{branch.name}</BranchName>
        {actionsElm}
      </BranchHeader>
    );
  };

  renderMasterBranchHeader = (branch) => {
    return (
      <BranchHeader>
        <BranchName>{branch.name}</BranchName>
        <BranchActions count={2}>
          <ButtonIcon data-tip="Support" onClick={this.props.onNewSupport}>
            S
          </ButtonIcon>
          <ButtonIcon data-tip="Hotfix" onClick={this.props.onNewHotFix}>
            H
          </ButtonIcon>
        </BranchActions>
      </BranchHeader>
    );
  };

  renderSupportBranchHeader = (branch) => {
    return (
      <BranchHeader>
        <BranchName>{branch.name}</BranchName>
        <BranchActions count={2}>
          {this.renderCommitButton(branch)}
          <ButtonIcon data-tip="Tag" onClick={this.props.onNewTagSupport}>
            T
          </ButtonIcon>
        </BranchActions>
      </BranchHeader>
    );
  };

  renderBranchHeaders = (param) => {
    const {
      masterBranch,
      developBranch,
      releaseBranches,
      featureBranches,
      hotFixBranches,
      supportBranches,
      noOfBranches,
    } = param;
    return (
      <GridColumn count={noOfBranches}>
        {supportBranches.map((b) => this.renderSupportBranchHeader(b))}
        {this.renderMasterBranchHeader(masterBranch)}
        {hotFixBranches.map((b) => this.renderReleaseBranchHeader(b))}
        {releaseBranches.map((b) => this.renderReleaseBranchHeader(b))}
        {this.renderDevelopBranchHeader(developBranch)}
        {featureBranches.map((b) => this.renderFeatureBranchHeader(b))}
      </GridColumn>
    );
  };

  renderBranchCommits = (param) => {
    const {
      masterBranch,
      developBranch,
      releaseBranches,
      featureBranches,
      hotFixBranches,
      supportBranches,
      noOfBranches,
    } = param;
    let branches = [
      masterBranch,
      ...hotFixBranches,
      ...releaseBranches,
      developBranch,
      ...featureBranches,
      ...supportBranches,
    ];
    return (
      <GridColumn count={noOfBranches}>
        <ConnectionsContainer innerRef={this.cacheConnectionsContainer} />
        {branches.map((branch, index) => {
          return this.renderBranchCommit(branch, index);
        })}
      </GridColumn>
    );
  };

  renderBranchCommit = (branch, branchIndex) => {
    const { commits } = this.props.project;
    const branchCommits = commits.filter((c) => c.branch === branch.id);
    let isMasterBranch = branch.name === "master";
    return (
      <Commits
        className={branch.merged ? "merged" : ""}
        color={branch.color}
        key={"branch-" + branch.id}
        height={branchCommits.length * 45 + "px"}
      >
        {branchCommits.map((commit, idx) => {
          return (
            <Commit
              className={branch.merged ? "merged" : ""}
              innerRef={this.storeCommitPosition.bind(
                this,
                commit.id,
                branchIndex
              )}
              key={"commit-" + commit.id}
              color={branch.color}
              top={commit.gridIndex - 1}
            >
              {isMasterBranch ? (
                <Tag>{commit.semver.toString()}</Tag>
              ) : (
                commit.id
              )}
            </Commit>
          );
        })}
      </Commits>
    );
  };

  render() {
    const { project } = this.props;
    const { branches } = project;
    const masterBranch = branches.find((b) => b.name === "master");
    const hotFixBranches = branches.filter((b) => b.hotFixBranch);
    const developBranch = branches.find((b) => b.name === "develop");
    const releaseBranches = branches.filter((b) => b.releaseBranch);
    const featureBranches = branches.filter((b) => b.featureBranch);
    const supportBranches = branches.filter((b) => b.supportBranch);
    const noOfBranches = branches.length;
    const param = {
      masterBranch,
      hotFixBranches,
      developBranch,
      featureBranches,
      releaseBranches,
      supportBranches,
      noOfBranches,
    };
    return (
      <GitFlowElm>
        <GlobalActions>
          <fil>
            <label for="hotfixNameId">Hotfix name:</label>
            <input
              data-tip="hello world"
              type="text"
              id="hotfixNameId"
              name="Hotfix Name"
              placeholder="Hotfix name"
              onKeyUp={this.props.onSetEnableDisableButtonHotfix}
            ></input>
            <Button id="hotfixButtonId" onClick={this.props.onNewHotFix}>
              New Hot Fix
            </Button>
          </fil>
          <fil>
            <label for="releaseNameId">Release name:</label>
            <input
              type="text"
              id="releaseNameId"
              name="Release Name"
              placeholder="Release name"
            ></input>
            <Button onClick={this.props.onNewRelease}>New Release</Button>
          </fil>
          <fil>
            <label for="featureNameId">Feature name:</label>
            <input
              type="text"
              id="featureNameId"
              name="Feature Name"
              placeholder="Feature name"
            ></input>
            <Button onClick={this.props.onNewFeature}>New Feature</Button>
          </fil>
          <br />
          <fil>
            <label for="supportNameId">Support name:</label>
            <input
              type="text"
              id="supportNameId"
              name="Support name"
              placeholder="Support name"
            ></input>
          </fil>
          <fil>
            <label for="tagSupportNameId">Tag Support name:</label>
            <input
              type="text"
              id="tagSupportNameId"
              name="Tag support name"
              placeholder="Tag support name"
            ></input>
          </fil>
        </GlobalActions>
        <ProjectElm>
          {this.renderBranchHeaders(param)}
          {this.renderBranchCommits(param)}
        </ProjectElm>
        <GoeyFilter />
      </GitFlowElm>
    );
  }
}

export default GitFlow;
