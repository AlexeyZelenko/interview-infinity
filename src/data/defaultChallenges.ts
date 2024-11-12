export const defaultChallenges = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers in the array such that they add up to \`target\`.
    You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
        difficulty: 'easy',
        topics: ['Arrays', 'Hash Table'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function twoSum(nums, target) {
  // Your code here
}`,
            python: `def two_sum(nums, target):
    # Your code here
    pass`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
            { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' }
        ],
        submissions: 1000,
        successRate: 75,
        example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9'
    },
    {
        id: 'palindrome-number',
        title: 'Palindrome Number',
        description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
        difficulty: 'easy',
        topics: ['Math', 'Algorithms'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function isPalindrome(x) {
  // Your code here
}`,
            python: `def is_palindrome(x):
    # Your code here
    pass`,
            java: `class Solution {
    public boolean isPalindrome(int x) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'x = 121', expected: 'true' },
            { input: 'x = -121', expected: 'false' }
        ],
        submissions: 800,
        successRate: 80,
        example: 'Input: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and right to left.'
    },
    {
        id: 'merge-sorted-arrays',
        title: 'Merge Sorted Arrays',
        description: `Merge two sorted arrays nums1 and nums2 into a single sorted array.
    The number of elements initialized in nums1 and nums2 are m and n respectively.`,
        difficulty: 'medium',
        topics: ['Arrays', 'Two Pointers'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function merge(nums1, m, nums2, n) {
  // Your code here
}`,
            python: `def merge(nums1, m, nums2, n):
    # Your code here
    pass`,
            java: `class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', expected: '[1,2,2,3,5,6]' },
            { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', expected: '[1]' }
        ],
        submissions: 600,
        successRate: 65,
        example: 'Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]'
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        description: 'Write a function that reverses a string in-place.',
        difficulty: 'easy',
        topics: ['Strings', 'Two Pointers'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function reverseString(s) {
  // Your code here
}`,
            python: `def reverse_string(s):
    # Your code here
    pass`,
            java: `class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 's = ["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
            { input: 's = ["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' }
        ],
        submissions: 700,
        successRate: 85,
        example: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]'
    },
    {
        id: 'fibonacci',
        title: 'Fibonacci Number',
        description: 'Calculate the nth number in the Fibonacci sequence.',
        difficulty: 'easy',
        topics: ['Math', 'Dynamic Programming'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function fib(n) {
  // Your code here
}`,
            python: `def fib(n):
    # Your code here
    pass`,
            java: `class Solution {
    public int fib(int n) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'n = 4', expected: '3' },
            { input: 'n = 10', expected: '55' }
        ],
        submissions: 900,
        successRate: 70,
        example: 'Input: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3'
    },
    {
        id: 'binary-search',
        title: 'Binary Search',
        description: 'Implement binary search to find a target value in a sorted array.',
        difficulty: 'medium',
        topics: ['Arrays', 'Binary Search'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function search(nums, target) {
  // Your code here
}`,
            python: `def search(nums, target):
    # Your code here
    pass`,
            java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'nums = [-1,0,3,5,9,12], target = 9', expected: '4' },
            { input: 'nums = [-1,0,3,5,9,12], target = 2', expected: '-1' }
        ],
        submissions: 500,
        successRate: 60,
        example: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4'
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
        difficulty: 'medium',
        topics: ['Stack', 'String'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function isValid(s) {
  // Your code here
}`,
            python: `def is_valid(s):
    # Your code here
    pass`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 's = "()"', expected: 'true' },
            { input: 's = "([)]"', expected: 'false' }
        ],
        submissions: 800,
        successRate: 55,
        example: 'Input: s = "()"\nOutput: true'
    },
    {
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        description: 'Find the length of the longest substring without repeating characters.',
        difficulty: 'hard',
        topics: ['String', 'Sliding Window', 'Hash Table'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function lengthOfLongestSubstring(s) {
  // Your code here
}`,
            python: `def length_of_longest_substring(s):
    # Your code here
    pass`,
            java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 's = "abcabcbb"', expected: '3' },
            { input: 's = "bbbbb"', expected: '1' }
        ],
        submissions: 400,
        successRate: 45,
        example: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.'
    },
    {
        id: 'max-subarray',
        title: 'Maximum Subarray',
        description: 'Find the contiguous subarray with the largest sum.',
        difficulty: 'medium',
        topics: ['Array', 'Dynamic Programming'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function maxSubArray(nums) {
  // Your code here
}`,
            python: `def max_sub_array(nums):
    # Your code here
    pass`,
            java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
            { input: 'nums = [1]', expected: '1' }
        ],
        submissions: 600,
        successRate: 50,
        example: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.'
    },
    {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'easy',
        topics: ['Dynamic Programming'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function climbStairs(n) {
  // Your code here
}`,
            python: `def climb_stairs(n):
    # Your code here
    pass`,
            java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'n = 2', expected: '2' },
            { input: 'n = 3', expected: '3' }
        ],
        submissions: 700,
        successRate: 65,
        example: 'Input: n = 2\nOutput: 2\nExplanation: There are two ways: 1 step + 1 step, 2 steps'
    },
    {
        id: 'rotate-array',
        title: 'Rotate Array',
        description: 'Given an array, rotate the array to the right by k steps, where k is non-negative.',
        difficulty: 'medium',
        topics: ['Arrays', 'Math'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function rotate(nums, k) {
  // Your code here
}`,
            python: `def rotate(nums, k):
    # Your code here
    pass`,
            java: `class Solution {
    public void rotate(int[] nums, int k) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'nums = [1,2,3,4,5,6,7], k = 3', expected: '[5,6,7,1,2,3,4]' },
            { input: 'nums = [-1,-100,3,99], k = 2', expected: '[3,99,-1,-100]' }
        ],
        submissions: 550,
        successRate: 58,
        example: 'Input: nums = [1,2,3,4,5,6,7], k = 3\nOutput: [5,6,7,1,2,3,4]'
    },
    {
        id: 'first-unique-char',
        title: 'First Unique Character',
        description: 'Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.',
        difficulty: 'easy',
        topics: ['String', 'Hash Table'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function firstUniqChar(s) {
  // Your code here
}`,
            python: `def first_uniq_char(s):
    # Your code here
    pass`,
            java: `class Solution {
    public int firstUniqChar(String s) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 's = "leetcode"', expected: '0' },
            { input: 's = "loveleetcode"', expected: '2' }
        ],
        submissions: 800,
        successRate: 72,
        example: 'Input: s = "leetcode"\nOutput: 0\nExplanation: The first unique character is "l"'
    },
    {
        id: 'group-anagrams',
        title: 'Group Anagrams',
        description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
        difficulty: 'medium',
        topics: ['String', 'Hash Table', 'Sorting'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function groupAnagrams(strs) {
  // Your code here
}`,
            python: `def group_anagrams(strs):
    # Your code here
    pass`,
            java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
            { input: 'strs = [""]', expected: '[[""]]' }
        ],
        submissions: 450,
        successRate: 48,
        example: 'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]'
    },
    {
        id: 'container-with-most-water',
        title: 'Container With Most Water',
        description: 'Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis form a container that contains the most water.',
        difficulty: 'hard',
        topics: ['Array', 'Two Pointers', 'Greedy'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function maxArea(height) {
  // Your code here
}`,
            python: `def max_area(height):
    # Your code here
    pass`,
            java: `class Solution {
    public int maxArea(int[] height) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 'height = [1,8,6,2,5,4,8,3,7]', expected: '49' },
            { input: 'height = [1,1]', expected: '1' }
        ],
        submissions: 300,
        successRate: 40,
        example: 'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: The maximum area is obtained by choosing height[1] = 8 and height[8] = 7'
    },
    {
        id: 'word-break',
        title: 'Word Break',
        description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
        difficulty: 'hard',
        topics: ['Dynamic Programming', 'String', 'Hash Table'],
        languages: ['JavaScript', 'Python', 'Java'],
        starterCode: {
            javascript: `function wordBreak(s, wordDict) {
  // Your code here
}`,
            python: `def word_break(s, word_dict):
    # Your code here
    pass`,
            java: `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        // Your code here
    }
}`
        },
        testCases: [
            { input: 's = "leetcode", wordDict = ["leet","code"]', expected: 'true' },
            { input: 's = "applepenapple", wordDict = ["apple","pen"]', expected: 'true' }
        ],
        submissions: 250,
        successRate: 35,
        example: 'Input: s = "leetcode", wordDict = ["leet","code"]\nOutput: true\nExplanation: Return true because "leetcode" can be segmented as "leet code".'
    }
];