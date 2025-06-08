#!/bin/bash
# Claude Code aliases for common tasks

alias claude-debug='claude -p "ultrathink and debug the issue: "'
alias claude-architect='claude -p "think hard about scalability and design architecture for: "'
alias claude-feature='claude -p "break down this feature into detailed tasks: "'
alias claude-test='claude -p "create comprehensive tests for: "'
alias claude-refactor='claude -p "think about code quality and refactor: "'

echo "Claude aliases loaded! Use:"
echo "  claude-debug 'issue description'"
echo "  claude-architect 'feature name'"
echo "  claude-feature 'feature description'"
echo "  claude-test 'component name'"
echo "  claude-refactor 'code section'"